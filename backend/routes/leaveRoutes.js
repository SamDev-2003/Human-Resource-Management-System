const router = require('express').Router();
const c = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');
router.post('/',          protect, c.apply);
router.get('/my',         protect, c.myLeaves);
router.get('/all',        protect, authorize('admin','hr_manager'), c.getAll);
router.put('/:id/status', protect, authorize('admin','hr_manager'), c.updateStatus);
router.delete('/:id',     protect, c.remove);
module.exports = router;
