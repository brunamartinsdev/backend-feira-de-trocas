import { Router } from "express";
import propostaController from  "../controllers/propostaController.js"

const router = Router();

router.post("/", propostaController.createProposta);
router.put("/:id/aceitar", propostaController.acceptProposta);
router.put("/:id/recusar", propostaController.refuseProposta);
router.get("/", propostaController.getPropostas);
router.get("/:id", propostaController.getPropostaById);

export default router;