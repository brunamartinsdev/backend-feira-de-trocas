import { Router } from "express";
import categoriaController from "../controllers/categoriaController.js";

const router = Router();

router.get('/', categoriaController.getCategorias);

export default router;