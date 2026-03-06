const Incident = require('../models/Incident');
const ExcelJS  = require('exceljs');
const PDFDoc   = require('pdfkit');

const getIncidents = async (from, to) => {
  const query = {};
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to)   query.createdAt.$lte = new Date(new Date(to).setHours(23,59,59,999));
  }
  return Incident.find(query)
    .populate('userId',     'name email')
    .populate('engineerId', 'name email')
    .sort({ createdAt: -1 });
};

exports.exportExcel = async (req, res) => {
  const { from, to } = req.query;
  const incidents    = await getIncidents(from, to);
  const workbook     = new ExcelJS.Workbook();
  const ws           = workbook.addWorksheet('Incidents Report');
  ws.columns = [
    { header: 'Incident ID', key: 'id',         width: 20 },
    { header: 'Title',       key: 'title',       width: 35 },
    { header: 'Category',    key: 'category',    width: 15 },
    { header: 'Priority',    key: 'priority',    width: 12 },
    { header: 'Status',      key: 'status',      width: 15 },
    { header: 'Requester',   key: 'requester',   width: 20 },
    { header: 'Engineer',    key: 'engineer',    width: 20 },
    { header: 'Created At',  key: 'createdAt',   width: 22 },
  ];
  ws.getRow(1).eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  incidents.forEach((inc, idx) => {
    const row = ws.addRow({
      id:        'INC-' + inc._id.toString().slice(-4).toUpperCase(),
      title:     inc.title,
      category:  inc.category || 'Other',
      priority:  (inc.priority || 'medium').toUpperCase(),
      status:    (inc.status || 'open').replace('-',' ').toUpperCase(),
      requester: inc.userId ? inc.userId.name : 'Unknown',
      engineer:  inc.engineerId ? inc.engineerId.name : 'Unassigned',
      createdAt: new Date(inc.createdAt).toLocaleString('en-US'),
    });
    row.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? 'FFFFFFFF' : 'FFF8F9FF' } };
      cell.font = { size: 10 };
    });
    row.height = 22;
  });
  ws.addRow(['Total: ' + incidents.length]).getCell(1).font = { bold: true, color: { argb: 'FF4F46E5' } };
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=incidents-' + Date.now() + '.xlsx');
  await workbook.xlsx.write(res);
  res.end();
};

exports.exportPDF = async (req, res) => {
  const { from, to } = req.query;
  const incidents    = await getIncidents(from, to);
  const doc          = new PDFDoc({ margin: 40, size: 'A4', layout: 'landscape' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=incidents-' + Date.now() + '.pdf');
  doc.pipe(res);
  doc.fontSize(20).fillColor('#4F46E5').text('HelpDesk Pro - Incidents Report', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#94A3B8').text('Generated: ' + new Date().toLocaleString() + '  |  Total: ' + incidents.length, { align: 'center' });
  doc.moveDown(1);
  const colX    = [40, 115, 265, 340, 400, 475, 575, 675];
  const colW    = [70, 145, 70, 55, 70, 95, 95, 90];
  const headers = ['INC ID', 'Title', 'Category', 'Priority', 'Status', 'Requester', 'Engineer', 'Created'];
  const rowH    = 22;
  let y         = doc.y;
  doc.rect(40, y, 760, rowH).fill('#4F46E5');
  doc.fillColor('#FFFFFF').fontSize(8.5);
  headers.forEach(function(h, i) { doc.text(h, colX[i] + 4, y + 6, { width: colW[i], lineBreak: false }); });
  y += rowH;
  incidents.forEach(function(inc, idx) {
    if (y > 520) { doc.addPage({ layout: 'landscape' }); y = 40; }
    doc.rect(40, y, 760, rowH).fill(idx % 2 === 0 ? '#FFFFFF' : '#F8F9FF');
    var title = (inc.title || '').substring(0, 26) + ((inc.title || '').length > 26 ? '...' : '');
    var row = [
      'INC-' + inc._id.toString().slice(-4).toUpperCase(),
      title,
      inc.category || 'Other',
      (inc.priority || 'medium').toUpperCase(),
      (inc.status || 'open').replace('-', ' ').toUpperCase(),
      (inc.userId ? inc.userId.name : 'Unknown').substring(0, 14),
      (inc.engineerId ? inc.engineerId.name : 'Unassigned').substring(0, 14),
      new Date(inc.createdAt).toLocaleDateString('en-US'),
    ];
    row.forEach(function(val, i) {
      doc.fillColor('#1E293B').fontSize(8).text(val, colX[i] + 4, y + 7, { width: colW[i] - 4, lineBreak: false });
    });
    doc.rect(40, y, 760, rowH).stroke('#E2E8F0');
    y += rowH;
  });
  doc.moveDown(1);
  var open     = incidents.filter(function(i) { return i.status === 'open'; }).length;
  var resolved = incidents.filter(function(i) { return i.status === 'resolved' || i.status === 'closed'; }).length;
  doc.fontSize(10).fillColor('#4F46E5').text('Total: ' + incidents.length + '  |  Open: ' + open + '  |  Resolved: ' + resolved, 40);
  doc.end();
};

exports.getStats = async (req, res) => {
  const { from, to } = req.query;
  const incidents    = await getIncidents(from, to);
  const byCategory   = {};
  const byPriority   = {};
  incidents.forEach(function(i) {
    var cat = i.category || 'Other';
    var pri = i.priority || 'medium';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    byPriority[pri] = (byPriority[pri] || 0) + 1;
  });
  res.json({
    total:      incidents.length,
    open:       incidents.filter(function(i) { return i.status === 'open'; }).length,
    inProgress: incidents.filter(function(i) { return i.status === 'in-progress'; }).length,
    resolved:   incidents.filter(function(i) { return i.status === 'resolved' || i.status === 'closed'; }).length,
    breached:   incidents.filter(function(i) { return new Date() > new Date(i.slaDeadline) && i.status !== 'resolved'; }).length,
    byCategory: byCategory,
    byPriority: byPriority,
  });
};