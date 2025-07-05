import express from "express";
import { authenticateAdmin } from "../controllers/admController.js";

const router = express.Router();

router.get('/', authenticateAdmin, (req, res) => {
  res.status(200).json({ message: "Bem-vindo à rota de administrador!" });
});

export default router;