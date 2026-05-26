const Attendance = require('../models/Attendance');
const Employee   = require('../models/Employee');

// normalize date (start of day)
const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// helper: safe employee fetch
const getEmployee = async (userId) => {
  return await Employee.findOne({ user: userId });
};

exports.checkIn = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: missing user"
      });
    }

    const emp = await getEmployee(req.user.id);
    if (!emp) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    const today = todayStart();

    const existing = await Attendance.findOne({
      employee: emp._id,
      date: today
    });

    const now = new Date();
    const nineAM = new Date();
    nineAM.setHours(9, 0, 0, 0);

    const status = now > nineAM ? "late" : "present";

    let record;

    if (existing) {
      record = await Attendance.findByIdAndUpdate(
        existing._id,
        { checkIn: now, status },
        { new: true }
      );
    } else {
      record = await Attendance.create({
        employee: emp._id,
        date: today,
        checkIn: now,
        status
      });
    }

    res.json({ success: true, attendance: record });

  } catch (e) {
    console.log("CHECKIN ERROR:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const emp = await getEmployee(req.user.id);
    if (!emp) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    const record = await Attendance.findOne({
      employee: emp._id,
      date: todayStart()
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "No attendance record found"
      });
    }

    if (!record.checkIn) {
      return res.status(400).json({
        message: "No check-in today"
      });
    }

    if (record.checkOut) {
      return res.status(400).json({
        message: "Already checked out"
      });
    }

    const now = new Date();

    record.checkOut = now;
    record.workHours = parseFloat(
      ((now - record.checkIn) / 3600000).toFixed(2)
    );

    await record.save();

    res.json({ success: true, attendance: record });

  } catch (e) {
    console.log("CHECKOUT ERROR:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.todayStatus = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false });
    }

    const emp = await getEmployee(req.user.id);
    if (!emp) {
      return res.json({ success: true, attendance: null });
    }

    const record = await Attendance.findOne({
      employee: emp._id,
      date: todayStart()
    });

    res.json({ success: true, attendance: record });

  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.myHistory = async (req, res) => {
  try {
    const emp = await getEmployee(req.user.id);
    if (!emp) {
      return res.json({ success: true, records: [] });
    }

    const { month, year } = req.query;

    let q = { employee: emp._id };

    if (month && year) {
      q.date = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59)
      };
    }

    const records = await Attendance.find(q).sort('-date');

    res.json({
      success: true,
      count: records.length,
      records
    });

  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { date, employee } = req.query;

    let q = {};

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      q.date = d;
    }

    if (employee) q.employee = employee;

    const records = await Attendance.find(q)
      .populate({
        path: 'employee',
        select: 'firstName lastName employeeId department',
        populate: { path: 'department', select: 'name' }
      })
      .sort('-date');

    res.json({
      success: true,
      count: records.length,
      records
    });

  } catch (e) {
    console.log("GET ALL ERROR:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};