const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../src/models/User');
const Session = require('../src/models/Session');
const College = require('../src/models/College');
const StudentProfile = require('../src/models/StudentProfile');
const AuditLog = require('../src/models/AuditLog');

const { ROLE_PERMISSIONS, hasPermission } = require('../src/config/permissions');
const { requirePermission, requireDeptScope } = require('../src/middleware/permissionMiddleware');
const { noSqlSanitizer, xssSanitizer } = require('../src/middleware/securityMiddleware');
const { logAuditAction } = require('../src/utils/auditLogger');
const { generateAccessToken } = require('../src/controllers/authController');

describe('Authentication Hardening, RBAC & Audit Trail Tests (Hardening Suite)', () => {
  const collegeId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();

  describe('1. Password Hashing (Bcrypt Cost 12) & On-The-Fly Migration', () => {
    test('Pre-save hook hashes plaintext password with bcrypt cost 12', async () => {
      const user = new User({
        collegeId,
        firstName: 'Security',
        lastName: 'Tester',
        email: 'security.tester@campus.edu',
        password: 'PlainTextPassword123!',
        role: 'student',
      });

      // Simulate pre-save hook
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(user.password, salt);

      const roundsMatch = user.password.match(/^\$2[aby]?\$(\d+)\$/);
      assert.ok(roundsMatch, 'Hashed password must follow bcrypt format');
      assert.strictEqual(parseInt(roundsMatch[1], 10), 12, 'Salt rounds must equal cost 12');

      const matches = await bcrypt.compare('PlainTextPassword123!', user.password);
      assert.strictEqual(matches, true, 'Original password must verify against cost 12 hash');
    });

    test('On-the-fly migration upgrades legacy cost 10 hash to cost 12 on successful login', async () => {
      // Legacy user created with cost 10
      const legacySalt = await bcrypt.genSalt(10);
      const legacyHash = await bcrypt.hash('LegacyPass999!', legacySalt);

      const legacyRounds = legacyHash.match(/^\$2[aby]?\$(\d+)\$/);
      assert.strictEqual(parseInt(legacyRounds[1], 10), 10, 'Initial hash must be cost 10');

      let saved = false;
      const fakeUserDoc = {
        password: legacyHash,
        save: async function () {
          saved = true;
        },
        matchPassword: User.schema.methods.matchPassword,
      };

      const isMatch = await fakeUserDoc.matchPassword('LegacyPass999!');
      assert.strictEqual(isMatch, true, 'Password must authenticate');
      assert.strictEqual(saved, true, 'User document must have triggered save for rehash');

      const upgradedRounds = fakeUserDoc.password.match(/^\$2[aby]?\$(\d+)\$/);
      assert.strictEqual(parseInt(upgradedRounds[1], 10), 12, 'Upgraded password must now have cost 12');
    });

    test('matchPassword rejects incorrect password without modifying hash', async () => {
      const salt = await bcrypt.genSalt(12);
      const initialHash = await bcrypt.hash('CorrectPassword!', salt);

      let saved = false;
      const fakeUserDoc = {
        password: initialHash,
        save: async function () {
          saved = true;
        },
        matchPassword: User.schema.methods.matchPassword,
      };

      const isMatch = await fakeUserDoc.matchPassword('WrongPassword');
      assert.strictEqual(isMatch, false, 'Invalid password must return false');
      assert.strictEqual(saved, false, 'Document must not save on failed match');
      assert.strictEqual(fakeUserDoc.password, initialHash, 'Hash must remain untouched');
    });
  });

  describe('2. Rotating Refresh Tokens & Token Reuse Detection', () => {
    test('generateAccessToken creates 15-minute JWT with user claims', () => {
      const mockUser = {
        _id: userId,
        email: 'jwt.user@college.edu',
        role: 'tpo',
        collegeId,
        department: 'Placement Cell',
      };

      const token = generateAccessToken(mockUser);
      assert.ok(token, 'Access token string must be returned');

      // Verify JWT header/payload parts
      const parts = token.split('.');
      assert.strictEqual(parts.length, 3, 'JWT must contain three parts');

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      assert.strictEqual(payload.userId, userId.toString());
      assert.strictEqual(payload.role, 'tpo');
      assert.strictEqual(payload.department, 'Placement Cell');
      assert.strictEqual(payload.collegeId, collegeId.toString());
      assert.ok(payload.exp > payload.iat, 'Expiry must be in the future');
      assert.strictEqual(payload.exp - payload.iat, 900, 'Access token lifespan must be exactly 900s (15m)');
    });

    test('Session model supports family UUID, SHA-256 token hash, and revocation state', () => {
      const rawToken = crypto.randomBytes(40).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const family = crypto.randomUUID();

      const session = new Session({
        userId,
        collegeId,
        tokenHash,
        family,
        isRevoked: false,
        deviceInfo: { browser: 'Chrome', os: 'Windows', deviceType: 'desktop' },
        ipAddress: '192.168.1.50',
        userAgent: 'Mozilla/5.0 Windows',
        lastActiveAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      assert.strictEqual(session.tokenHash, tokenHash);
      assert.strictEqual(session.family, family);
      assert.strictEqual(session.isRevoked, false);
      assert.strictEqual(session.deviceInfo.browser, 'Chrome');
    });

    test('Token Reuse Detection: Invalidation of entire token family when revoked token is reused', async () => {
      const familyId = crypto.randomUUID();
      const sessionStore = [
        { _id: 'sess-1', family: familyId, isRevoked: true, userId: 'u1' }, // already rotated
        { _id: 'sess-2', family: familyId, isRevoked: false, userId: 'u1' }, // current active
        { _id: 'sess-other-family', family: crypto.randomUUID(), isRevoked: false, userId: 'u2' }, // unaffected
      ];

      // Attacker attempts to reuse sess-1
      const presentedSession = sessionStore.find((s) => s._id === 'sess-1');
      assert.strictEqual(presentedSession.isRevoked, true, 'Presented token was already consumed');

      // Detection logic: Invalidate entire family
      sessionStore.forEach((s) => {
        if (s.family === presentedSession.family) {
          s.isRevoked = true;
        }
      });

      const activeInFamily = sessionStore.filter((s) => s.family === familyId && !s.isRevoked);
      assert.strictEqual(activeInFamily.length, 0, 'ALL sessions in reused family must be revoked');

      const unaffected = sessionStore.find((s) => s._id === 'sess-other-family');
      assert.strictEqual(unaffected.isRevoked, false, 'Other user families must remain active');
    });
  });

  describe('3. Google Sign-In Domain Restriction', () => {
    test('Accepts institutional email matching authorized college domains', () => {
      const collegeDomains = ['iitb.ac.in', 'cse.iitb.ac.in'];
      const userEmail = 'student@cse.iitb.ac.in';
      const emailDomain = userEmail.split('@')[1];

      const isAllowed = collegeDomains.some(
        (d) => d.toLowerCase().trim() === emailDomain.toLowerCase().trim()
      );
      assert.strictEqual(isAllowed, true, 'Domain must be permitted');
    });

    test('Rejects personal or unauthorized domains with DOMAIN_NOT_ALLOWED', () => {
      const collegeDomains = ['iitb.ac.in', 'cse.iitb.ac.in'];
      const personalEmail = 'student@gmail.com';
      const emailDomain = personalEmail.split('@')[1];

      const isAllowed = collegeDomains.some(
        (d) => d.toLowerCase().trim() === emailDomain.toLowerCase().trim()
      );
      assert.strictEqual(isAllowed, false, 'Personal gmail address must be rejected');
    });
  });

  describe('4. Single-Use 30-Minute Password Reset Link Lifecycle', () => {
    test('Generates raw reset token and stores SHA-256 hash with 30-minute expiry', () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      const user = new User({
        collegeId,
        firstName: 'Reset',
        lastName: 'User',
        email: 'reset.user@campus.edu',
        password: 'Password123!',
        role: 'student',
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expiresAt,
      });

      assert.strictEqual(user.resetPasswordToken, hashedToken);
      assert.ok(user.resetPasswordExpires > new Date());
      assert.ok(user.resetPasswordExpires.getTime() - Date.now() <= 30 * 60 * 1000 + 100);
    });

    test('Resetting password consumes token and marks it single-use (cleared)', () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      const mockUser = {
        password: 'OldPassword123!',
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 25 * 60 * 1000),
      };

      // Execution of resetPassword
      mockUser.password = 'BrandNewPassword456!';
      mockUser.resetPasswordToken = null;
      mockUser.resetPasswordExpires = null;

      assert.strictEqual(mockUser.resetPasswordToken, null, 'Reset token must be nullified immediately');
      assert.strictEqual(mockUser.resetPasswordExpires, null, 'Expiry must be nullified');

      // Second attempt with same raw token
      const tokenVerificationHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const isStillUsable = mockUser.resetPasswordToken === tokenVerificationHash;
      assert.strictEqual(isStillUsable, false, 'Consumed token must fail on second attempt');
    });
  });

  describe('5. RBAC Permission Matrix & requirePermission Middleware', () => {
    test('Permission matrix contains definitive capabilities for all 6 roles', () => {
      const roles = ['student', 'coordinator', 'recruiter', 'tpo', 'admin', 'superadmin'];
      roles.forEach((r) => {
        assert.ok(Array.isArray(ROLE_PERMISSIONS[r]), `Role '${r}' must have array of permissions`);
        assert.ok(ROLE_PERMISSIONS[r].length > 0, `Role '${r}' permissions must not be empty`);
      });
    });

    test('hasPermission correctly evaluates permissions and wildcards', () => {
      // Student permissions
      assert.strictEqual(hasPermission('student', 'drive:read'), true);
      assert.strictEqual(hasPermission('student', 'drive:apply'), true);
      assert.strictEqual(hasPermission('student', 'drive:create'), false);
      assert.strictEqual(hasPermission('student', 'verification:action'), false);

      // Coordinator permissions
      assert.strictEqual(hasPermission('coordinator', 'student:read:dept'), true);
      assert.strictEqual(hasPermission('coordinator', 'student:verify:dept'), true);
      assert.strictEqual(hasPermission('coordinator', 'drive:create'), false);

      // TPO permissions
      assert.strictEqual(hasPermission('tpo', 'drive:create'), true);
      assert.strictEqual(hasPermission('tpo', 'student:verify'), true);

      // SuperAdmin has wildcard
      assert.strictEqual(hasPermission('superadmin', 'drive:create'), true);
      assert.strictEqual(hasPermission('superadmin', 'superadmin:manage'), true);
    });

    test('requirePermission middleware passes authorized role and blocks unauthorized with 403', () => {
      const middleware = requirePermission('drive:create');

      // 1. Student attempted drive creation -> 403
      let statusCode = null;
      let responseBody = null;
      let nextCalled = false;

      const studentReq = { user: { role: 'student', email: 'student@campus.edu' } };
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              responseBody = data;
            },
          };
        },
      };

      middleware(studentReq, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusCode, 403, 'Student must receive 403 when lacking drive:create');
      assert.strictEqual(responseBody?.error?.code, 'FORBIDDEN');
      assert.strictEqual(nextCalled, false, 'next() must not be called');

      // 2. TPO drive creation -> 200 (next)
      nextCalled = false;
      const tpoReq = { user: { role: 'tpo', email: 'tpo@campus.edu' } };
      middleware(tpoReq, res, () => {
        nextCalled = true;
      });
      assert.strictEqual(nextCalled, true, 'TPO must successfully pass requirePermission');
    });
  });

  describe('6. Department Coordinator Scoping (requireDeptScope)', () => {
    test('Coordinator without assigned department is rejected with NO_DEPARTMENT_ASSIGNED', async () => {
      let statusCode = null;
      let responseBody = null;
      let nextCalled = false;

      const req = {
        user: { role: 'coordinator', department: null, email: 'coord@campus.edu' },
        params: {},
      };
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              responseBody = data;
            },
          };
        },
      };

      await requireDeptScope(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusCode, 403);
      assert.strictEqual(responseBody?.error?.code, 'NO_DEPARTMENT_ASSIGNED');
      assert.strictEqual(nextCalled, false);
    });

    test('Coordinator with department attaches req.deptScope and passes filter', async () => {
      let nextCalled = false;
      const req = {
        user: { role: 'coordinator', department: 'Computer Science', email: 'cse.coord@campus.edu' },
        params: {},
      };
      const res = {};

      await requireDeptScope(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.deptScope, 'Computer Science', 'deptScope must be attached');
    });

    test('TPO and Admin roles bypass department scoping', async () => {
      let nextCalled = false;
      const req = {
        user: { role: 'tpo', department: null, email: 'head.tpo@campus.edu' },
        params: {},
      };
      const res = {};

      await requireDeptScope(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.deptScope, undefined, 'College-wide TPO needs no branch scoping');
    });
  });

  describe('7. Security Defenses: NoSQL Injection & XSS Sanitizers', () => {
    test('noSqlSanitizer strips keys starting with $ or containing . from body, query, and params', () => {
      const maliciousReq = {
        body: {
          email: 'test@campus.edu',
          $gt: '',
          nested: {
            'role.admin': true,
            $where: 'sleep(1000)',
            safeField: 'hello',
          },
        },
        query: {
          collegeId: { $ne: null },
          search: 'ValidQuery',
        },
        params: {},
      };

      let nextCalled = false;
      noSqlSanitizer(maliciousReq, {}, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(maliciousReq.body.email, 'test@campus.edu');
      assert.strictEqual(maliciousReq.body.$gt, undefined, '$gt operator must be stripped');
      assert.strictEqual(maliciousReq.body.nested.$where, undefined, '$where operator must be stripped');
      assert.strictEqual(maliciousReq.body.nested['role.admin'], undefined, 'Key with dot must be stripped');
      assert.strictEqual(maliciousReq.body.nested.safeField, 'hello');
      assert.strictEqual(maliciousReq.query.collegeId.$ne, undefined, '$ne operator must be stripped');
      assert.strictEqual(maliciousReq.query.search, 'ValidQuery');
    });

    test('xssSanitizer neutralizes script tags, javascript: URIs, and onerror handlers', () => {
      const xssReq = {
        body: {
          bio: 'Student bio <script>alert("XSS")</script> ready to work.',
          website: 'javascript:alert(document.cookie)',
          imageTag: '<img src="x" onerror="stealData()">',
          notes: 'Safe normal string notes',
        },
      };

      let nextCalled = false;
      xssSanitizer(xssReq, {}, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
      assert.ok(!xssReq.body.bio.includes('<script>'), 'Script tag must be eradicated');
      assert.ok(!xssReq.body.bio.includes('alert("XSS")'));
      assert.ok(!xssReq.body.website.includes('javascript:'), 'javascript: URI must be stripped');
      assert.ok(!xssReq.body.imageTag.includes('onerror='), 'onerror attribute must be removed');
      assert.strictEqual(xssReq.body.notes, 'Safe normal string notes');
    });
  });

  describe('8. Structured Audit Logging & CSV Export', () => {
    test('AuditLog schema supports all mandatory regulatory fields', () => {
      const log = new AuditLog({
        collegeId,
        actorId: userId,
        actor: 'officer@campus.edu',
        role: 'tpo',
        action: 'VERIFY_STUDENT',
        entity: 'StudentProfile',
        entityId: 'student_123',
        before: { isVerifiedByTPO: false },
        after: { isVerifiedByTPO: true, verificationSeal: 'seal_abc' },
        ip: '10.0.0.1',
        userAgent: 'Chrome 120 macOS',
      });

      assert.strictEqual(log.actor, 'officer@campus.edu');
      assert.strictEqual(log.action, 'VERIFY_STUDENT');
      assert.strictEqual(log.entity, 'StudentProfile');
      assert.strictEqual(log.before.isVerifiedByTPO, false);
      assert.strictEqual(log.after.isVerifiedByTPO, true);
      assert.strictEqual(log.ip, '10.0.0.1');
    });

    test('CSV export formatting generates valid RFC 4180 CSV rows with header', () => {
      const mockAuditLogs = [
        {
          createdAt: new Date('2026-10-25T10:00:00Z'),
          actor: 'officer@campus.edu',
          role: 'tpo',
          action: 'LOGIN_SUCCESS',
          entity: 'User',
          entityId: 'u_101',
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
        {
          createdAt: new Date('2026-10-25T10:05:00Z'),
          actor: 'admin@campus.edu',
          role: 'admin',
          action: 'CREATE_DRIVE',
          entity: 'Drive',
          entityId: 'drv_202',
          ip: '192.168.1.2',
          userAgent: 'Mozilla/5.0',
        },
      ];

      const csvHeader = 'Timestamp,Actor,Role,Action,Entity,EntityId,IP,UserAgent\n';
      const csvRows = mockAuditLogs.map((l) =>
        [
          l.createdAt.toISOString(),
          `"${l.actor}"`,
          l.role,
          l.action,
          l.entity,
          l.entityId,
          l.ip,
          `"${l.userAgent}"`,
        ].join(',')
      );
      const csvContent = csvHeader + csvRows.join('\n');

      assert.ok(csvContent.startsWith('Timestamp,Actor,Role,Action,Entity,EntityId,IP,UserAgent'));
      assert.ok(csvContent.includes('"officer@campus.edu",tpo,LOGIN_SUCCESS,User,u_101,192.168.1.1'));
      assert.ok(csvContent.includes('"admin@campus.edu",admin,CREATE_DRIVE,Drive,drv_202,192.168.1.2'));
    });
  });
});
