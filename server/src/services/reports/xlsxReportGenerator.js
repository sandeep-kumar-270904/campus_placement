const xlsx = require('xlsx');

/**
 * Builds a multi-sheet, structured XLSX workbook binary buffer.
 */
function generateXlsxReportBuffer({ title, collegeName, summary, rows, departmentBreakdown }) {
  const wb = xlsx.utils.book_new();

  // Sheet 1: Detailed Data Rows
  const wsData = xlsx.utils.json_to_sheet(rows.length > 0 ? rows : [{ Status: 'No records matching query' }]);
  xlsx.utils.book_append_sheet(wb, wsData, 'Audit Data');

  // Sheet 2: Executive Summary & Department Metrics
  const summaryRows = [
    { Metric: 'Institutional Name', Value: collegeName || 'Campus Partner' },
    { Metric: 'Report Title', Value: title || 'Placement Audit Report' },
    { Metric: 'Generated At', Value: new Date().toISOString() },
    { Metric: 'Total Graduating Cohort', Value: summary?.totalCohort || rows.length },
    { Metric: 'Placed Candidates', Value: summary?.placedCount || 0 },
    { Metric: 'Placement Rate (%)', Value: `${summary?.placementPercentage || 0}%` },
    { Metric: 'Median CTC (LPA)', Value: `${summary?.medianCtc || 0} LPA` },
    { Metric: 'Average CTC (LPA)', Value: `${summary?.averageCtc || 0} LPA` },
    { Metric: 'Highest CTC (LPA)', Value: `${summary?.highestCtc || 0} LPA` },
    { Metric: 'Higher Studies Admissions', Value: summary?.higherStudiesCount || 0 },
    { Metric: 'Entrepreneurship / Startups', Value: summary?.entrepreneurshipCount || 0 },
    { Metric: 'Total Progression Rate (%)', Value: `${summary?.progressionRate || 0}%` },
  ];

  const wsSummary = xlsx.utils.json_to_sheet(summaryRows);
  xlsx.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

  if (departmentBreakdown && departmentBreakdown.length > 0) {
    const wsDept = xlsx.utils.json_to_sheet(departmentBreakdown);
    xlsx.utils.book_append_sheet(wb, wsDept, 'Department Breakdown');
  }

  const buffer = xlsx.write(wb, {
    type: 'buffer',
    bookType: 'xlsx',
  });

  return buffer;
}

module.exports = {
  generateXlsxReportBuffer,
};
