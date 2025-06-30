import { authenticateToken } from '../controllers/loginController.js';

   //Rota autenticada (exemplo funcional)
app.get('/protected', authenticateToken, (req,res)=>{
  res.status(200).json({message:'Bem-vindo à rota autenticada!'});
})