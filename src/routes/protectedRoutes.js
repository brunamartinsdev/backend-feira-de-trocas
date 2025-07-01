import express from 'express';
import loginControllers from '../controllers/loginController.js';

const router = express.Router();

router.get('/protected', loginControllers.authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Bem-vindo à rota autenticada!' });
});

export default router;