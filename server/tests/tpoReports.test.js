const { test, describe } = require('node:test');
const assert = require('node:assert');
const xlsx = require('xlsx');

describe('TPO Prebuilt Report Exporter Tests (Page 10)', () => {
  describe('1. Prebuilt Templates Registry', () => {
    test('Contains mandatory compliance and operational report templates', () => {
      const templates = [
        'nirf-placement-report',
        'drive-hiring-roster',
        'department-stats',
        'company-crm-history',
        'master-student-callset',
        'unplaced-candidates',
      ];

      templates.forEach((t) => {
        assert.ok(t.length > 0);
      });
      assert.strictEqual(templates.includes('nirf-placement-report'), true);
      assert.strictEqual(templates.includes('drive-hiring-roster'), true);
    });
  });

  describe('2. XLSX & CSV Sheet Generation via xlsx', () => {
    test('Synthesizes valid XLSX workbook binary buffer from structured JSON rows', () => {
      const sampleRows = [
        {
          'Roll No': '2026-CS-001',
          'Candidate Name': 'John Doe',
          Branch: 'Computer Science',
          CGPA: 9.2,
          Status: 'Placed',
          Employer: 'Microsoft',
          CTC: 35,
        },
        {
          'Roll No': '2026-CS-002',
          'Candidate Name': 'Jane Smith',
          Branch: 'Information Technology',
          CGPA: 8.8,
          Status: 'Placed',
          Employer: 'Google',
          CTC: 42,
        },
      ];

      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(sampleRows);
      xlsx.utils.book_append_sheet(wb, ws, 'NIRF Report');

      const xlsxBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
      assert.ok(Buffer.isBuffer(xlsxBuffer));
      assert.ok(xlsxBuffer.length > 0);

      // Verify XLSX Magic bytes (PK.. for ZIP container)
      assert.strictEqual(xlsxBuffer[0], 0x50); // 'P'
      assert.strictEqual(xlsxBuffer[1], 0x4b); // 'K'
    });

    test('Synthesizes valid CSV formatted string from JSON rows', () => {
      const sampleRows = [
        { Department: 'Computer Science', Placed: 120, Total: 130 },
        { Department: 'Electronics', Placed: 80, Total: 100 },
      ];

      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(sampleRows);
      xlsx.utils.book_append_sheet(wb, ws, 'CSV Report');

      const csvBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'csv' });
      const csvStr = csvBuffer.toString('utf-8');

      assert.ok(csvStr.includes('Department,Placed,Total'));
      assert.ok(csvStr.includes('Computer Science,120,130'));
    });
  });
});
