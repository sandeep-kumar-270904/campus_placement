const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { performBackup } = require('../scripts/backupDatabase');
const { performRestore } = require('../scripts/restoreDatabase');

describe('Database Automated Backup & Disaster Recovery Verification', () => {
  const TEST_BACKUP_DIR = path.resolve(__dirname, '../backups_test_temp');
  const testCollectionName = 'students_dr_archive';

  // In-memory collection target for resilient test execution
  const mockDb = {
    [testCollectionName]: {
      docs: [
        { studentName: 'Aditya Sharma', rollNo: '21CS001', cgpa: 9.2, verified: true },
        { studentName: 'Sneha Patel', rollNo: '21CS002', cgpa: 8.8, verified: true },
        { studentName: 'Kavita Reddy', rollNo: '21CS003', cgpa: 7.9, verified: false },
      ],
      find: function () {
        return {
          lean: () => ({
            exec: async () => this.docs,
          }),
        };
      },
      deleteMany: async function () {
        this.docs = [];
      },
      insertMany: async function (newDocs) {
        this.docs = [...newDocs];
      },
      countDocuments: async function () {
        return this.docs.length;
      },
    },
  };

  before(() => {
    if (fs.existsSync(TEST_BACKUP_DIR)) {
      fs.rmSync(TEST_BACKUP_DIR, { recursive: true, force: true });
    }
  });

  after(() => {
    if (fs.existsSync(TEST_BACKUP_DIR)) {
      fs.rmSync(TEST_BACKUP_DIR, { recursive: true, force: true });
    }
  });

  test('Step 1: Collection contains 3 initial academic records', () => {
    assert.strictEqual(mockDb[testCollectionName].docs.length, 3);
  });

  test('Step 2: performBackup generates timestamped directory, .json.gz file, and metadata descriptor', async () => {
    const backupResult = await performBackup(TEST_BACKUP_DIR, mockDb);
    assert.ok(backupResult.success, 'Backup must return success true');
    assert.ok(fs.existsSync(backupResult.backupFolder), 'Backup directory must exist');

    const metadataPath = path.join(backupResult.backupFolder, 'metadata.json');
    assert.ok(fs.existsSync(metadataPath), 'metadata.json must exist');

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    assert.strictEqual(metadata.collections[testCollectionName], 3);

    const gzPath = path.join(backupResult.backupFolder, `${testCollectionName}.json.gz`);
    assert.ok(fs.existsSync(gzPath), `${testCollectionName}.json.gz archive must exist`);
  });

  test('Step 3: Simulates database disaster by wiping the database records', async () => {
    mockDb[testCollectionName].docs = [];
    assert.strictEqual(mockDb[testCollectionName].docs.length, 0, 'Database records wiped');
  });

  test('Step 4: performRestore recovers deleted records with 100% data fidelity and count verification', async () => {
    const folders = fs
      .readdirSync(TEST_BACKUP_DIR)
      .filter((n) => n.startsWith('backup-'));
    const latestFolder = path.join(TEST_BACKUP_DIR, folders[0]);

    const restoreResult = await performRestore(latestFolder, mockDb);
    assert.ok(restoreResult.success, 'Restore must complete with success true');
    assert.strictEqual(restoreResult.restoredCollections[testCollectionName], 3);

    const restoredDocs = mockDb[testCollectionName].docs;
    assert.strictEqual(restoredDocs.length, 3);
    assert.strictEqual(restoredDocs[0].studentName, 'Aditya Sharma');
    assert.strictEqual(restoredDocs[0].cgpa, 9.2);
    assert.strictEqual(restoredDocs[1].studentName, 'Sneha Patel');
    assert.strictEqual(restoredDocs[2].studentName, 'Kavita Reddy');
  });
});
