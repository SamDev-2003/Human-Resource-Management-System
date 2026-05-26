const router = require('express').Router();
const { getAll, getOne, create, update, remove, uploadPhoto } = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb)  => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/',           protect, getAll);
router.get('/:id',        protect, getOne);
router.post('/',          protect, authorize('admin','hr_manager'), create);
router.put('/:id',        protect, authorize('admin','hr_manager'), update);
router.delete('/:id',     protect, authorize('admin','hr_manager'), remove);
router.post('/:id/photo', protect, upload.single('photo'), uploadPhoto);
module.exports = router;
