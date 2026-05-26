const Employee   = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave      = require('../models/Leave');
const Payroll    = require('../models/Payroll');
const PDFDocument = require('pdfkit');

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

exports.employeeReport = async (req, res) => {
  try {
    const employees = await Employee.find({ status:'active' }).populate('department','name').sort('firstName');
    res.json({ success: true, count: employees.length, employees });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.attendanceReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const records = await Attendance.find({
      date: { $gte: new Date(year, month-1, 1), $lte: new Date(year, month, 0, 23,59,59) }
    }).populate('employee','firstName lastName employeeId').sort('date');
    res.json({ success: true, count: records.length, records });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.leaveReport = async (req, res) => {
  try {
    const { year } = req.query;
    const leaves = await Leave.find({
      startDate: { $gte: new Date(year,0,1), $lte: new Date(year,11,31) }
    }).populate('employee','firstName lastName employeeId').sort('startDate');
    res.json({ success: true, count: leaves.length, leaves });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.payrollReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const payrolls = await Payroll.find({ month, year })
      .populate('employee','firstName lastName employeeId department position');
    const totalNet = payrolls.reduce((s, p) => s + p.netSalary, 0);
    res.json({ success: true, count: payrolls.length, payrolls, totalNet });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.downloadEmployeePDF = async (req, res) => {
  try {
    const employees = await Employee.find({ status:'active' }).populate('department','name').sort('firstName');
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition','attachment; filename=employees-report.pdf');
    doc.pipe(res);
    doc.fontSize(20).fillColor('#1e40af').text('SmartTech Ltd', { align:'center' });
    doc.fontSize(14).fillColor('#374151').text('Employee Report', { align:'center' });
    doc.fontSize(9).fillColor('#6b7280').text(`Generated: ${new Date().toDateString()}`, { align:'center' });
    doc.moveDown().moveTo(50,doc.y).lineTo(550,doc.y).strokeColor('#e5e7eb').stroke().moveDown();
    employees.forEach((e, i) => {
      doc.fontSize(11).fillColor('#111827').text(`${i+1}. ${e.firstName} ${e.lastName}  (${e.employeeId})`);
      doc.fontSize(9).fillColor('#6b7280').text(`   ${e.position} | ${e.department?.name||'N/A'} | ${e.email} | ${e.phone||'—'}`);
      doc.moveDown(0.3);
    });
    doc.end();
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.downloadPayrollPDF = async (req, res) => {
  try {
    const { month, year } = req.query;
    const payrolls = await Payroll.find({ month, year }).populate('employee','firstName lastName employeeId position');
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition',`attachment; filename=payroll-${month}-${year}.pdf`);
    doc.pipe(res);
    doc.fontSize(20).fillColor('#1e40af').text('SmartTech Ltd', { align:'center' });
    doc.fontSize(14).fillColor('#374151').text(`Payroll Report — ${MONTHS[month-1]} ${year}`, { align:'center' });
    doc.fontSize(9).fillColor('#6b7280').text(`Generated: ${new Date().toDateString()}`, { align:'center' });
    doc.moveDown().moveTo(50,doc.y).lineTo(550,doc.y).strokeColor('#e5e7eb').stroke().moveDown();
    let total = 0;
    payrolls.forEach((p, i) => {
      total += p.netSalary;
      doc.fontSize(11).fillColor('#111827').text(`${i+1}. ${p.employee?.firstName} ${p.employee?.lastName}  (${p.employee?.employeeId})`);
      doc.fontSize(9).fillColor('#6b7280').text(`   Basic: $${p.basicSalary} | Bonus: $${p.bonus} | Deductions: $${p.taxDeduction+p.otherDeductions} | Net: $${p.netSalary} | ${p.status}`);
      doc.moveDown(0.3);
    });
    doc.moveDown().moveTo(50,doc.y).lineTo(550,doc.y).strokeColor('#e5e7eb').stroke().moveDown();
    doc.fontSize(12).fillColor('#1e40af').text(`Total Net Payroll: $${total.toLocaleString()}`, { align:'right' });
    doc.end();
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
