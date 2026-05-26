const router = require('express').Router();
const { stats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');
router.get('/stats', protect, authorize('admin','hr_manager'), stats);
module.exports = router;
