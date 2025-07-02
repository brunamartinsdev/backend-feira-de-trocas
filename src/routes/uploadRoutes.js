import { Router } from "express";
import { uploadSingleImage } from "../middleware/uploadImage.js";
import { uploadImage } from "../controllers/uploadController.js";

const router = Router();

router.post('/upload', uploadSingleImage, uploadImage);

export default router;