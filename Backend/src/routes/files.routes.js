import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import * as filesController from "../controllers/files.controller.js";
import uploadMiddleware from "../middlewares/multer.middleware.js";
import { checkQuota } from "../middlewares/quota.middleware.js";
const filesRouter = Router();
filesRouter.post("/create-folder", requireAuth, filesController.createFolder);
filesRouter.get(
  ["/files-folders-sorted", "/files-folders-sorted/:folderId"],
  requireAuth,
  filesController.getFilesAndFolder,
);
filesRouter.post(
  "/upload",
  requireAuth,
  uploadMiddleware.array("files", 10),
  checkQuota,
  filesController.uploadFiles,
);
filesRouter.get("/stream/:fileId", requireAuth, filesController.streamFile);

export default filesRouter;
