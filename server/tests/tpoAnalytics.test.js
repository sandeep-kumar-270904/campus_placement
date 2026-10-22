const { test, describe } = require('node:test');
const assert = require('node:assert');

describe('TPO Institutional Analytics Tests (Page 9)', () => {
  describe('1. Placement Rate & CTC Metric Computation', () => {
    test('Calculates overall placement % and average/median CTC accurately', () => {
      const cohort = [
        { isPlaced: true, ctc: 12 },
        { isPlaced: true, ctc: 18 },
        { isPlaced: true, ctc: 30 },
        { isPlaced: false, ctc: 0 },
        { isPlaced: false, ctc: 0 },
      ];

      const total = cohort.length;
      const placed = cohort.filter((s) => s.isPlaced).length;
      const placementRate = total > 0 ? (placed / total) * 100 : 0;

      const placedCtcs = cohort.filter((s) => s.isPlaced).map((s) => s.ctc).sort((a, b) => a - b);
      const avgCtc = placedCtcs.reduce((a, b) => a + b, 0) / placedCtcs.length;
      const medianCtc = placedCtcs[Math.floor(placedCtcs.length / 2)];

      assert.strictEqual(placementRate, 60);
      assert.strictEqual(avgCtc, 20);
      assert.strictEqual(medianCtc, 18);
    });
  });

  describe('2. CTC Band Distribution Slicing', () => {
    test('Categorizes packages into correct salary bands', () => {
      const ctcPackages = [3.5, 4.8, 6.5, 9.2, 12.0, 14.5, 18.0, 24.0, 32.5, 45.0];

      const ctcBands = [
        { band: '< 5 LPA', count: 0 },
        { band: '5 - 10 LPA', count: 0 },
        { band: '10 - 15 LPA', count: 0 },
        { band: '15 - 25 LPA', count: 0 },
        { band: '> 25 LPA', count: 0 },
      ];

      ctcPackages.forEach((val) => {
        if (val < 5) ctcBands[0].count++;
        else if (val <= 10) ctcBands[1].count++;
        else if (val <= 15) ctcBands[2].count++;
        else if (val <= 25) ctcBands[3].count++;
        else ctcBands[4].count++;
      });

      assert.strictEqual(ctcBands[0].count, 2); // 3.5, 4.8
      assert.strictEqual(ctcBands[1].count, 2); // 6.5, 9.2
      assert.strictEqual(ctcBands[2].count, 2); // 12.0, 14.5
      assert.strictEqual(ctcBands[3].count, 2); // 18.0, 24.0
      assert.strictEqual(ctcBands[4].count, 2); // 32.5, 45.0
    });
  });

  describe('3. Recruitment Funnel Monotonicity & Drop-Off', () => {
    test('Ensures funnel stages reflect natural candidate progression', () => {
      const totalRegistered = 500;
      const applied = 420;
      const passedAssessment = 210;
      const passedTech = 95;
      const passedHr = 60;
      const placed = 55;

      assert.ok(totalRegistered >= applied);
      assert.ok(applied >= passedAssessment);
      assert.ok(passedAssessment >= passedTech);
      assert.ok(passedTech >= passedHr);
      assert.ok(passedHr >= placed);

      const conversionRate = ((placed / totalRegistered) * 100).toFixed(1);
      assert.strictEqual(conversionRate, '11.0');
    });
  });

  describe('4. Multiple Offer Candidate Detection', () => {
    test('Identifies candidates with multiple offers and aggregates company list', () => {
      const candidateOffers = [
        { studentId: 's1', offers: [{ company: 'Google', ctc: 32 }, { company: 'Amazon', ctc: 28 }] },
        { studentId: 's2', offers: [{ company: 'TCS', ctc: 7 }] },
        { studentId: 's3', offers: [{ company: 'Microsoft', ctc: 40 }, { company: 'Adobe', ctc: 25 }, { company: 'Uber', ctc: 35 }] },
      ];

      const multiple = candidateOffers.filter((c) => c.offers.length >= 2);
      assert.strictEqual(multiple.length, 2);
      assert.strictEqual(multiple[0].studentId, 's1');
      assert.strictEqual(multiple[1].studentId, 's3');
      assert.strictEqual(multiple[1].offers.length, 3);
    });
  });
});
