const router = require('express').Router();
const c = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');
router.post('/checkin',     protect, c.checkIn);
router.post('/checkout',    protect, c.checkOut);
router.get('/today-status', protect, c.todayStatus);
router.get('/my',           protect, c.myHistory);
router.get('/all',          protect, authorize('admin','hr_manager'), c.getAll);
module.exports = router;
