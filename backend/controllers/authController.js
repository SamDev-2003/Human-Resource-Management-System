const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const token = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, role });
    res.status(201).json({ success: true, token: token(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isActive)
      return res.status(401).json({ success: false, message: 'Account deactivated' });
    res.json({ success: true, token: token(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, employee: user.employee } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate('employee');
  res.json({ success: true, user });
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { currentPassword, newPassword } = req.body;
    if (!(await user.matchPassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate('employee', 'firstName lastName employeeId');
    res.json({ success: true, count: users.length, users });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
