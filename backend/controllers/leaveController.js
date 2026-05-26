const Leave    = require('../models/Leave');
const Employee = require('../models/Employee');

exports.apply = async (req, res) => {
  try {
    const emp = await Employee.findOne({ user: req.user.id });
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    const leave = await Leave.create({ ...req.body, employee: emp._id });
    res.status(201).json({ success: true, leave });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.myLeaves = async (req, res) => {
  try {
    const emp    = await Employee.findOne({ user: req.user.id });
    const leaves = await Leave.find({ employee: emp._id }).sort('-createdAt');
    res.json({ success: true, count: leaves.length, leaves });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getAll = async (req, res) => {
  try {
    const q = {};
    if (req.query.status)    q.status    = req.query.status;
    if (req.query.leaveType) q.leaveType = req.query.leaveType;
    const leaves = await Leave.find(q)
      .populate('employee','firstName lastName employeeId department')
      .populate('approvedBy','name')
      .sort('-createdAt');
    res.json({ success: true, count: leaves.length, leaves });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, approvalNote } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, approvalNote, approvedBy: req.user._id, approvedAt: new Date() },
      { new: true }
    ).populate('employee','firstName lastName');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    res.json({ success: true, leave });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Not found' });
    if (leave.status !== 'pending')
      return res.status(400).json({ success: false, message: 'Can only cancel pending requests' });
    await leave.deleteOne();
    res.json({ success: true, message: 'Leave cancelled' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
