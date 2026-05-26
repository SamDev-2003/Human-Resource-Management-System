const Employee    = require('../models/Employee');
const Department  = require('../models/Department');
const Leave       = require('../models/Leave');
const Attendance  = require('../models/Attendance');
const Payroll     = require('../models/Payroll');

exports.stats = async (req, res) => {
  try {
    const totalEmployees   = await Employee.countDocuments({ status: 'active' });
    const totalDepartments = await Department.countDocuments({ isActive: true });
    const pendingLeaves    = await Leave.countDocuments({ status: 'pending' });

    const today = new Date(); today.setHours(0,0,0,0);
    const todayPresent = await Attendance.countDocuments({ date: today, status: { $in: ['present','late'] } });

    const now = new Date();
    const payrollAgg = await Payroll.aggregate([
      { $match: { month: now.getMonth()+1, year: now.getFullYear() } },
      { $group: { _id: null, total: { $sum: '$netSalary' } } },
    ]);
    const monthlyPayroll = payrollAgg[0]?.total || 0;

    const deptStats = await Employee.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $project: { name: { $arrayElemAt: ['$dept.name', 0] }, count: 1 } },
    ]);

    const recentLeaves = await Leave.find()
      .populate('employee','firstName lastName')
      .sort('-createdAt').limit(5);

    res.json({ success: true,
      stats: { totalEmployees, totalDepartments, pendingLeaves, todayPresent, monthlyPayroll },
      deptStats, recentLeaves });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
