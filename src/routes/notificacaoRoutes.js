import { Router } from "express";
import notificacaoController from "../controllers/notificacaoController.js";
import loginControllers from "../controllers/loginController.js";
const { authenticateToken } = loginControllers;

const router = Router();

router.get('/', authenticateToken, notificacaoController.getNotificacoes);
router.put('/marcar-como-lidas', authenticateToken, notificacaoController.marcarComoLidas);

export default router;''