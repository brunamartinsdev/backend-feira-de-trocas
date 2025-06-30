import { Router } from "express";
import loginControllers from "../controllers/loginController.js";

const router = Router();

router.post("/", loginControllers.login);
router.post("/", loginControllers.authenticateToken);

export default router;
