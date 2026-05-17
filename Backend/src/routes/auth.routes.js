import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.get("/refresh-token", authController.refreshToken);
authRouter.get("/get-me", authController.getme);
authRouter.get("/logout", authController.logout);
authRouter.get("/logout-all", authController.logoutAll);
authRouter.get("/login", authController.login);

export default authRouter;
