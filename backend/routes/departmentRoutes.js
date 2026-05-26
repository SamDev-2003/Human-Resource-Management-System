const router = require('express').Router();
const c = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
router.get('/',       protect, c.getAll);
router.get('/:id',    protect, c.getOne);
router.post('/',      protect, authorize('admin','hr_manager'), c.create);
router.put('/:id',    protect, authorize('admin','hr_manager'), c.update);
router.delete('/:id', protect, authorize('admin'), c.remove);
module.exports = router;
