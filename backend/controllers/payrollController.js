const Payroll  = require('../models/Payroll');
const Employee = require('../models/Employee');

exports.generate = async (req, res) => {
  try {
    const { employeeId, month, year, allowances=0, overtime=0, bonus=0, taxDeduction=0, otherDeductions=0 } = req.body;
    const emp = await Employee.findById(employeeId);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    const exists = await Payroll.findOne({ employee: employeeId, month, year });
    if (exists) return res.status(400).json({ success: false, message: 'Payroll already generated for this period' });
    const payroll = await Payroll.create({
      employee: employeeId, month, year,
      basicSalary: emp.salary, allowances, overtime, bonus, taxDeduction, otherDeductions,
      generatedBy: req.user.id,
    });
    res.status(201).json({ success: true, payroll });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getAll = async (req, res) => {
  try {
    const q = {};
    if (req.query.month) q.month = req.query.month;
    if (req.query.year)  q.year  = req.query.year;
    const payrolls = await Payroll.find(q)
      .populate('employee','firstName lastName employeeId department')
      .sort('-createdAt');
    res.json({ success: true, count: payrolls.length, payrolls });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.myPayroll = async (req, res) => {
  try {
    const emp      = await Employee.findOne({ user: req.user.id });
    const payrolls = await Payroll.find({ employee: emp._id }).sort('-year -month');
    res.json({ success: true, count: payrolls.length, payrolls });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.markPaid = async (req, res) => {
  try {
    const p = await Payroll.findByIdAndUpdate(
      req.params.id, { status: 'paid', paidAt: new Date() }, { new: true }
    );
    if (!p) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, payroll: p });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getById = async (req, res) => {
  try {
    const p = await Payroll.findById(req.params.id)
      .populate('employee','firstName lastName employeeId email position department')
      .populate('generatedBy','name');
    if (!p) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, payroll: p });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
