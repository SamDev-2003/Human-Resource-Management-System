const router = require('express').Router();
const c = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/authMiddleware');
router.post('/generate', protect, authorize('admin','hr_manager'), c.generate);
router.get('/all',       protect, authorize('admin','hr_manager'), c.getAll);
router.get('/my',        protect, c.myPayroll);
router.get('/:id',       protect, c.getById);
router.put('/:id/pay',   protect, authorize('admin','hr_manager'), c.markPaid);
module.exports = router;
