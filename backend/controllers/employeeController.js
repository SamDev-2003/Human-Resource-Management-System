const Employee = require('../models/Employee');
const User     = require('../models/User');
const path     = require('path');
const fs       = require('fs');

exports.getAll = async (req, res) => {
  try {
    const { department, status, search } = req.query;
    let q = {};
    if (department) q.department = department;
    if (status)     q.status = status;
    if (search)     q.$or = [
      { firstName:  { $regex: search, $options: 'i' } },
      { lastName:   { $regex: search, $options: 'i' } },
      { email:      { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
    ];
    const employees = await Employee.find(q).populate('department','name').sort('-createdAt');
    res.json({ success: true, count: employees.length, employees });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id).populate('department','name');
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, employee: emp });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const emp  = await Employee.create(req.body);
    const pass = `Smarttech@${Math.floor(1000 + Math.random() * 9000)}`;
    const user = await User.create({
      name: `${emp.firstName} ${emp.lastName}`,
      email: emp.email, password: pass, role: 'employee', employee: emp._id,
    });
    emp.user = user.id;
    await emp.save();
    res.status(201).json({ success: true, employee: emp, tempPassword: pass });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('department','name');
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, employee: emp });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.remove = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    if (emp.user) await User.findByIdAndDelete(emp.user);
    await emp.deleteOne();
    res.json({ success: true, message: 'Employee deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    const emp = await Employee.findByIdAndUpdate(req.params.id, { profilePhoto: url }, { new: true });
    res.json({ success: true, profilePhoto: emp.profilePhoto });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
