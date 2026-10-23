/**
 * Pure resilient PDF 1.4 Generator for institutional compliance reports.
 * Emits vector text, headers, table grids, summary statistics, and signature lines
 * with zero native external C++ dependencies.
 */

function escapePdfText(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Builds a multi-page or single-page PDF document buffer.
 * @param {Object} options
 * @param {string} options.title - Report title
 * @param {string} options.collegeName - Institutional title
 * @param {string} options.batchYear - Academic year / cohort
 * @param {Object} options.summary - KPI summary block { placedCount, medianCtc, etc. }
 * @param {Array<Object>} options.rows - Tabular data rows
 * @param {Array<Object>} options.signatories - Signatory titles and names
 */
function generatePdfReportBuffer({
  title = 'Institutional Placement & Accreditation Audit Report',
  collegeName = 'National Institute of Engineering & Technology',
  batchYear = '2025-2026',
  summary = {},
  rows = [],
  signatories = [
    { title: 'Training & Placement Officer', name: 'Dr. Placement Officer' },
    { title: 'Principal / Director', name: 'Dr. College Principal' },
  ],
}) {
  const pageWidth = 612; // US Letter width in pt
  const pageHeight = 792; // US Letter height in pt
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // We can paginate rows across pages (approx 20 rows per page)
  const maxRowsPerPage = 22;
  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / maxRowsPerPage));

  const pagesObjects = [];
  const contentObjects = [];

  // Determine headers from rows
  const headers = rows.length > 0 ? Object.keys(rows[0]).slice(0, 6) : ['Record', 'Status', 'Details'];
  const colWidth = Math.floor(contentWidth / headers.length);

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const pageRows = rows.slice((pageNum - 1) * maxRowsPerPage, pageNum * maxRowsPerPage);
    let streamOps = '';

    // Page Header & Letterhead
    if (pageNum === 1) {
      // Top Institutional Accent Bar (Dark Emerald / Teal fill)
      streamOps += `0.02 0.40 0.28 rg\n`;
      streamOps += `${margin} ${pageHeight - 65} ${contentWidth} 32 re f\n`;

      // Header Text (White)
      streamOps += `BT\n/F2 13 Tf\n1 1 1 rg\n`;
      streamOps += `${margin + 12} ${pageHeight - 54} Td\n`;
      streamOps += `(${escapePdfText(collegeName.toUpperCase())}) Tj\nET\n`;

      // Sub-header / Badge
      streamOps += `BT\n/F1 8 Tf\n0.8 1 0.9 rg\n`;
      streamOps += `${margin + 12} ${pageHeight - 62} Td\n`;
      streamOps += `(Accredited Institutional Training & Placement Office | NAAC / NIRF / NBA Compliance Record) Tj\nET\n`;

      // Document Title
      streamOps += `BT\n/F2 14 Tf\n0.1 0.15 0.2 rg\n`;
      streamOps += `${margin} ${pageHeight - 88} Td\n`;
      streamOps += `(${escapePdfText(title)}) Tj\nET\n`;

      // Meta Line
      streamOps += `BT\n/F1 9 Tf\n0.4 0.45 0.5 rg\n`;
      streamOps += `${margin} ${pageHeight - 102} Td\n`;
      streamOps += `(Graduating Cohort: ${escapePdfText(batchYear)}  |  Generated: ${new Date().toISOString().split('T')[0]}  |  Status: Verified Audit Log) Tj\nET\n`;

      // KPI Summary Box
      if (Object.keys(summary).length > 0) {
        streamOps += `0.94 0.97 0.95 rg\n`;
        streamOps += `${margin} ${pageHeight - 148} ${contentWidth} 36 re f\n`;
        streamOps += `0.7 0.85 0.75 RG 1 w\n`;
        streamOps += `${margin} ${pageHeight - 148} ${contentWidth} 36 re S\n`;

        streamOps += `BT\n/F2 9 Tf\n0.05 0.4 0.25 rg\n`;
        streamOps += `${margin + 10} ${pageHeight - 128} Td\n`;
        streamOps += `(Total Strength: ${summary.totalCohort || rows.length}   |   Placed: ${summary.placedCount || 0} (${summary.placementPercentage || 0}%)   |   Median CTC: ${summary.medianCtc || 0} LPA   |   Highest CTC: ${summary.highestCtc || 0} LPA   |   Higher Studies: ${summary.higherStudiesCount || 0}) Tj\nET\n`;
      }
    } else {
      // Continuation Header
      streamOps += `BT\n/F2 10 Tf\n0.2 0.3 0.35 rg\n`;
      streamOps += `${margin} ${pageHeight - 45} Td\n`;
      streamOps += `(${escapePdfText(collegeName)} — ${escapePdfText(title)} (Contd.)) Tj\nET\n`;
      streamOps += `0.7 0.7 0.7 RG 0.5 w\n`;
      streamOps += `${margin} ${pageHeight - 52} m ${pageWidth - margin} ${pageHeight - 52} l S\n`;
    }

    // Table Coordinates
    const tableTop = pageNum === 1 ? pageHeight - 165 : pageHeight - 65;

    // Table Header Band
    streamOps += `0.15 0.20 0.25 rg\n`;
    streamOps += `${margin} ${tableTop - 18} ${contentWidth} 18 re f\n`;

    streamOps += `BT\n/F2 8 Tf\n1 1 1 rg\n`;
    headers.forEach((h, i) => {
      const x = margin + i * colWidth + 5;
      const y = tableTop - 13;
      streamOps += `${i === 0 ? x : colWidth} ${i === 0 ? y : 0} Td (${escapePdfText(h.slice(0, 16))}) Tj\n`;
    });
    streamOps += `ET\n`;

    // Table Rows
    let currentY = tableTop - 18;
    pageRows.forEach((row, rowIdx) => {
      currentY -= 17;
      // Alternating row background
      if (rowIdx % 2 === 1) {
        streamOps += `0.97 0.98 0.99 rg\n`;
        streamOps += `${margin} ${currentY} ${contentWidth} 17 re f\n`;
      }
      // Row bottom border
      streamOps += `0.88 0.90 0.92 RG 0.5 w\n`;
      streamOps += `${margin} ${currentY} m ${pageWidth - margin} ${currentY} l S\n`;

      // Cell text
      streamOps += `BT\n/F1 7.5 Tf\n0.15 0.2 0.25 rg\n`;
      headers.forEach((h, colIdx) => {
        const val = row[h] !== undefined ? String(row[h]) : '—';
        const x = margin + colIdx * colWidth + 5;
        const y = currentY + 4;
        streamOps += `${colIdx === 0 ? x : colWidth} ${colIdx === 0 ? y : 0} Td (${escapePdfText(val.slice(0, 24))}) Tj\n`;
      });
      streamOps += `ET\n`;
    });

    // If on final page, draw institutional signatory block
    if (pageNum === totalPages) {
      const sigTop = Math.min(currentY - 40, 110);
      streamOps += `0.6 0.65 0.7 RG 1 w\n`;

      // Draw two signature lines
      signatories.slice(0, 2).forEach((sig, sIdx) => {
        const lineStartX = sIdx === 0 ? margin + 20 : pageWidth - margin - 200;
        const lineEndX = lineStartX + 180;
        streamOps += `${lineStartX} ${sigTop} m ${lineEndX} ${sigTop} l S\n`;

        streamOps += `BT\n/F2 8.5 Tf\n0.1 0.15 0.2 rg\n`;
        streamOps += `${lineStartX} ${sigTop - 12} Td\n`;
        streamOps += `(${escapePdfText(sig.name)}) Tj\nET\n`;

        streamOps += `BT\n/F1 7.5 Tf\n0.4 0.45 0.5 rg\n`;
        streamOps += `${lineStartX} ${sigTop - 23} Td\n`;
        streamOps += `(${escapePdfText(sig.title)}) Tj\nET\n`;
      });
    }

    // Page Number Footer
    streamOps += `BT\n/F1 7.5 Tf\n0.5 0.55 0.6 rg\n`;
    streamOps += `${pageWidth / 2 - 30} 22 Td\n`;
    streamOps += `(Page ${pageNum} of ${totalPages}  |  Official Placement Audit) Tj\nET\n`;

    contentObjects.push(streamOps);
  }

  // Assemble PDF cross-reference table and binary stream
  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length; // 1-based object number
  };

  // 1: Catalog
  const catalogObjNum = addObject(`<< /Type /Catalog /Pages 2 0 R >>`);

  // Font objects (Helvetica & Helvetica-Bold)
  // We'll insert Pages object after we know IDs
  const f1ObjNum = 4;
  const f2ObjNum = 5;

  const pageObjNums = [];
  const contentObjNums = [];

  let nextObjNum = 6;
  for (let i = 0; i < totalPages; i++) {
    const pageNum = nextObjNum++;
    const contentNum = nextObjNum++;
    pageObjNums.push(pageNum);
    contentObjNums.push(contentNum);
  }

  // 2: Pages root
  const pagesKids = pageObjNums.map((n) => `${n} 0 R`).join(' ');
  objects[1] = `<< /Type /Pages /Kids [ ${pagesKids} ] /Count ${totalPages} >>`;

  // 3: Font F1 (Helvetica)
  objects[2] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;
  // 4: Font F2 (Helvetica-Bold)
  objects[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`;

  // Write page and content objects
  for (let i = 0; i < totalPages; i++) {
    const pNum = pageObjNums[i];
    const cNum = contentObjNums[i];
    const stream = contentObjects[i];

    // Page object
    objects[pNum - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [ 0 0 ${pageWidth} ${pageHeight} ] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${cNum} 0 R >>`;
    // Content object with stream
    objects[cNum - 1] = `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`;
  }

  // Build final buffer with xref table
  let pdf = `%PDF-1.4\n`;
  const offsets = [];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += `0000000000 65535 f \n`;
  for (let i = 0; i < objects.length; i++) {
    const offsetStr = String(offsets[i]).padStart(10, '0');
    pdf += `${offsetStr} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf8');
}

module.exports = {
  generatePdfReportBuffer,
};
