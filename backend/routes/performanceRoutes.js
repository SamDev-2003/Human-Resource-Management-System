const router = require('express').Router();
const c = require('../controllers/performanceController');
const { protect, authorize } = require('../middleware/authMiddleware');
router.post('/',      protect, authorize('admin','hr_manager'), c.create);
router.get('/all',    protect, authorize('admin','hr_manager'), c.getAll);
router.get('/my',     protect, c.myPerformance);
router.put('/:id',    protect, authorize('admin','hr_manager'), c.update);
router.delete('/:id', protect, authorize('admin'), c.remove);
module.exports = router;
