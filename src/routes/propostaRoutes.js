import { Router } from "express";
import propostaController from  "../controllers/propostaController.js";
import loginControllers from "../controllers/loginController.js";
const { authenticateToken } = loginControllers;


const router = Router();

router.post("/", propostaController.createProposta);
router.put("/:id/aceitar", propostaController.aceitarProposta);
router.put("/:id/recusar", propostaController.recusarProposta);
router.get("/", propostaController.getPropostas);
router.get("/feitas", authenticateToken, propostaController.getPropostasFeitas);
router.get("/recebidas", authenticateToken, propostaController.getPropostasRecebidas);
router.get("/:id", propostaController.getPropostaById);
router.delete('/:id', authenticateToken, propostaController.deleteProposta);

export default router;