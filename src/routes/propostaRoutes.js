import { Router } from "express";
import propostaController from  "../controllers/propostaController.js"

const router = Router();

router.post("/", propostaController.createProposta);
router.put("/:id/aceitar", propostaController.aceitarProposta);
router.put("/:id/recusar", propostaController.recusarProposta);
router.get("/", propostaController.getPropostas);
router.get("/:id", propostaController.getPropostaById);
router.delete("/:id", propostaController.deleteProposta);

export default router;