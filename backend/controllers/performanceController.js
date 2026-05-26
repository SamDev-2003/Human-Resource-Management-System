const Performance = require('../models/Performance');
const Employee    = require('../models/Employee');

exports.create = async (req, res) => {
  try {
    const p = await Performance.create({ ...req.body, evaluatedBy: req.user._id });
    res.status(201).json({ success: true, performance: p });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getAll = async (req, res) => {
  try {
    const q = {};
    if (req.query.employee) q.employee = req.query.employee;
    if (req.query.period)   q.period   = req.query.period;
    const list = await Performance.find(q)
      .populate('employee','firstName lastName employeeId department')
      .populate('evaluatedBy','name')
      .sort('-createdAt');
    res.json({ success: true, count: list.length, evaluations: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.myPerformance = async (req, res) => {
  try {
    const emp  = await Employee.findOne({ user: req.user.id });
    const list = await Performance.find({ employee: emp._id })
      .populate('evaluatedBy','name').sort('-createdAt');
    res.json({ success: true, count: list.length, evaluations: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const p = await Performance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!p) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, performance: p });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    await Performance.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
