import express from 'express';
import loginControllers from '../controllers/loginController.js';

const router = express.Router();

// Rota protegida para admin
router.get('/admin', loginControllers.authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Bem-vindo à rota de administrador!' });
});

export default router;