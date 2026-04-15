import express from 'express';
import multer from 'multer';
import path from 'path';
import profileController from './profileController.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

// Cấu hình Multer để lưu file tạm thời
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
  }
});

// Tất cả các route trong module này đều yêu cầu đăng nhập
router.use(authMiddleware);

// Endpoint lấy thông tin hồ sơ
router.get('/', profileController.getProfile);

// Endpoint cập nhật thông tin hồ sơ
router.put('/', profileController.updateProfile);

// Endpoint tải lên ảnh đại diện (Single file upload)
router.post('/avatar', upload.single('avatar'), profileController.uploadAvatar);

// Endpoint lấy lịch sử trận đấu
router.get('/history', profileController.getMatchHistory);

export default router;
