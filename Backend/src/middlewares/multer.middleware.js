// middlewares/multer.middleware.js
import multer from "multer";

const storage = multer.memoryStorage();

// Set a hard limit of 10MB per single file as a baseline security measure
const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default uploadMiddleware;
