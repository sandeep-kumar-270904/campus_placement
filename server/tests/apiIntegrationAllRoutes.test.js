process.env.NODE_ENV = 'test';
const { test, describe, before } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = require('../src/index');
const User = require('../src/models/User');
const College = require('../src/models/College');
const Opportunity = require('../src/models/Opportunity');
const Application = require('../src/models/Application');
const { generateAccessToken } = require('../src/controllers/authController');

// Test helper to make HTTP requests directly to Express app
function makeRequest(app, options, body = null) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      const reqOptions = {
        hostname: '127.0.0.1',
        port,
        path: options.path,
        method: options.method || 'GET',
        headers: options.headers || {},
      };

      const req = http.request(reqOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          server.close();
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        });
      });

      req.on('error', (err) => {
        server.close();
        reject(err);
      });

      if (body) {
        const payload = typeof body === 'string' ? body : JSON.stringify(body);
        req.setHeader('Content-Type', 'application/json');
        req.write(payload);
      }
      req.end();
    });
  });
}

const { getJwtSecret } = require('../src/middleware/authMiddleware');

describe('API Integration Test Suite: All Routes, RBAC, Tenancy & Validation', () => {
  const collegeAId = new mongoose.Types.ObjectId().toString();
  const collegeBId = new mongoose.Types.ObjectId().toString();

  const studentUser = {
    id: new mongoose.Types.ObjectId().toString(),
    userId: new mongoose.Types.ObjectId().toString(),
    email: 'student@collegea.edu',
    role: 'student',
    collegeId: collegeAId,
  };

  const tpoUser = {
    id: new mongoose.Types.ObjectId().toString(),
    userId: new mongoose.Types.ObjectId().toString(),
    email: 'tpo@collegea.edu',
    role: 'tpo',
    collegeId: collegeAId,
  };

  const recruiterUser = {
    id: new mongoose.Types.ObjectId().toString(),
    userId: new mongoose.Types.ObjectId().toString(),
    email: 'recruiter@tech.com',
    role: 'recruiter',
    collegeId: collegeAId,
    companyName: 'TechCorp',
  };

  const collegeBStudent = {
    id: new mongoose.Types.ObjectId().toString(),
    userId: new mongoose.Types.ObjectId().toString(),
    email: 'student@collegeb.edu',
    role: 'student',
    collegeId: collegeBId,
  };

  const JWT_SECRET = getJwtSecret();
  const studentToken = jwt.sign(studentUser, JWT_SECRET, { expiresIn: '1h' });
  const tpoToken = jwt.sign(tpoUser, JWT_SECRET, { expiresIn: '1h' });
  const recruiterToken = jwt.sign(recruiterUser, JWT_SECRET, { expiresIn: '1h' });
  const collegeBToken = jwt.sign(collegeBStudent, JWT_SECRET, { expiresIn: '1h' });

  describe('1. Health & Observability Endpoints', () => {
    test('GET /healthz returns 200 or 503 with structured checks, uptime and X-Request-Id header', async () => {
      const res = await makeRequest(app, {
        path: '/healthz',
        method: 'GET',
        headers: { 'X-Request-Id': 'test-trace-id-12345' },
      });

      assert.ok([200, 503].includes(res.statusCode));
      assert.strictEqual(res.headers['x-request-id'], 'test-trace-id-12345');
      assert.ok(res.body.checks);
      assert.ok(typeof res.body.uptimeSeconds === 'number');
    });

    test('GET /healthz/liveness probe responds with 200 OK status live', async () => {
      const res = await makeRequest(app, { path: '/healthz/liveness', method: 'GET' });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.status, 'live');
    });
  });

  describe('2. Authentication & Authorization Boundaries', () => {
    test('POST /api/auth/login with missing email/password returns 400 Bad Request', async () => {
      const res = await makeRequest(app, {
        path: '/api/auth/login',
        method: 'POST',
      }, {});

      assert.strictEqual(res.statusCode, 400);
      assert.ok(res.body.error || res.body.message);
    });

    test('Accessing protected route without Bearer token returns 401 Unauthorized', async () => {
      const res = await makeRequest(app, {
        path: '/api/opportunities',
        method: 'GET',
      });

      assert.strictEqual(res.statusCode, 401);
    });
  });

  describe('3. Role-Based Access Control (RBAC) Enforcement', () => {
    test('Student attempting TPO action (POST /api/tpo/drives) is blocked with 403 Forbidden', async () => {
      const res = await makeRequest(app, {
        path: '/api/tpo/drives',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
        },
      }, { title: 'Unauthorized Drive' });

      assert.strictEqual(res.statusCode, 403);
    });

    test('Recruiter attempting TPO administrative verification is blocked with 403 Forbidden', async () => {
      const res = await makeRequest(app, {
        path: '/api/tpo/verification/12345/action',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${recruiterToken}`,
        },
      }, { action: 'approve' });

      assert.strictEqual(res.statusCode, 403);
    });

    test('Student accessing Recruiter portal endpoint (/api/recruiter/drives) is blocked with 403 Forbidden', async () => {
      const res = await makeRequest(app, {
        path: '/api/recruiter/drives',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${studentToken}`,
        },
      });

      assert.strictEqual(res.statusCode, 403);
    });
  });

  describe('4. Input Validation & Zod Schema Hardening', () => {
    test('POST /api/opportunities with empty title and negative CTC returns 400 with validation errors', async () => {
      const res = await makeRequest(app, {
        path: '/api/opportunities',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tpoToken}`,
        },
      }, {
        companyName: '',
        title: '',
        ctc: { fixed: -500 },
      });

      assert.strictEqual(res.statusCode, 400);
      assert.ok(res.body.error);
    });

    test('POST /api/tpo/policies/overrides with empty justification returns 400 Bad Request', async () => {
      const res = await makeRequest(app, {
        path: '/api/tpo/policies/overrides',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tpoToken}`,
        },
      }, {
        studentId: studentUser.id,
        opportunityId: new mongoose.Types.ObjectId().toString(),
        policyName: 'one_student_one_offer',
        reason: '', // Mandatory justification missing
      });

      assert.strictEqual(res.statusCode, 400);
      assert.ok(res.body.error);
    });
  });

  describe('5. Multi-Tenant Cross-College Boundary Isolation', () => {
    const { tenantContextMiddleware, getTenantContext } = require('../src/middleware/tenantContext');

    test('Tenant context middleware strictly scopes collegeId from authenticated req.user', async () => {
      await new Promise((resolve) => {
        const mockReq = {
          user: { collegeId: collegeAId, role: 'student' },
          headers: {},
        };
        const mockRes = {};

        tenantContextMiddleware(mockReq, mockRes, () => {
          assert.strictEqual(mockReq.tenant.collegeId, collegeAId);
          assert.strictEqual(getTenantContext().collegeId, collegeAId);
          resolve();
        });
      });
    });

    test('User from College A attempting to spoof header to College B is blocked with 403 CROSS_TENANT_FORBIDDEN', async () => {
      await new Promise((resolve) => {
        let statusCode = 0;
        let responseJson = null;

        const mockReq = {
          user: { collegeId: collegeAId, role: 'student' },
          headers: { 'x-college-id': collegeBId }, // Malicious cross-tenant spoofing attempt
        };

        const mockRes = {
          status: (code) => {
            statusCode = code;
            return {
              json: (data) => {
                responseJson = data;
                assert.strictEqual(statusCode, 403);
                assert.strictEqual(responseJson.error.code, 'CROSS_TENANT_FORBIDDEN');
                resolve();
              },
            };
          },
        };

        tenantContextMiddleware(mockReq, mockRes, () => {
          assert.fail('Should not proceed downstream on cross-tenant header spoof attempt');
        });
      });
    });

    test('Unauthenticated public requests have null tenant collegeId unless explicit header passed', async () => {
      await new Promise((resolve) => {
        const mockReq = { headers: {} };
        const mockRes = {};

        tenantContextMiddleware(mockReq, mockRes, () => {
          assert.strictEqual(mockReq.tenant.collegeId, null);
          assert.strictEqual(getTenantContext().collegeId, null);
          resolve();
        });
      });
    });
  });
});
