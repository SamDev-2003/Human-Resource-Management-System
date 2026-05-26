const Department = require('../models/Department');
const Employee   = require('../models/Employee');

exports.getAll = async (req, res) => {
  try {
    const depts = await Department.find().populate('manager','firstName lastName');
    const data  = await Promise.all(depts.map(async d => ({
      ...d.toObject(),
      employeeCount: await Employee.countDocuments({ department: d._id, status: 'active' }),
    })));
    res.json({ success: true, count: data.length, departments: data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const d = await Department.findById(req.params.id).populate('manager','firstName lastName');
    if (!d) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, department: d });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const d = await Department.create(req.body);
    res.status(201).json({ success: true, department: d });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const d = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!d) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, department: d });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    const count = await Employee.countDocuments({ department: req.params.id });
    if (count > 0)
      return res.status(400).json({ success: false, message: 'Cannot delete – department has employees' });
    await Department.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Department deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
