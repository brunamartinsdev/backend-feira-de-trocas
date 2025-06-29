import { Router } from "express";
import itensController from "../controllers/itemController.js";

const router = Router();

router.get('/', itensController.getItens);
router.get('/:id', itensController.getItemById);
router.post('/', itensController.createItem);
router.put('/:id', itensController.updateItem);
router.delete('/:id', itensController.deleteItem);

export default router;