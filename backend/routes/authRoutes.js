const router = require('express').Router();
const { register, login, getMe, changePassword, getAllUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.get('/users', protect, authorize('admin'), getAllUsers);
module.exports = router;
