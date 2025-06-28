import { Router } from "express";
import loginControllers from "../controllers/loginController.js";

const router = Router();

router.post("/", loginControllers.login);

export default router;
