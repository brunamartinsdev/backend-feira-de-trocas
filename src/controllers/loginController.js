import jwt from "jsonwebtoken"; //npm i jsonwebtoken
import prisma from "../models/prismaClient.js";

//Rota para realizar a autenticação e gerar token
const login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const user = await prisma.Usuario.findUnique({
      where: { email },
    });

    if (!user || user.senha !== senha) {
      return res.status(401).json({ message: "Email ou senha inválidos" });
    }

    const userValid = bcrypt.compareSync(senha,user.senha);
    if (!userValid) {
      return response.status(401).json({"error": "Unauthorized"})
    }

    const token = jwt.sign(
      {
        id: user.id,
        nome: user.nome,
      },
      SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    return res.json({ token });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }

};

//Middleware para auntenticar o token
const authenticateToken=(req,res,next) =>{
  const token= req.headers['authorization'];

  if(!token) return res.status(403).json({message:'Token não fornecido!'});

  jwt.verify(token, SECRET_KEY, (err,user)=>{
    if (err) return res.status(403).json({message:'Token inválido!'});
    req.user= user;
    next();
  })
}

const loginControllers = {
  login, authenticateToken,
};

export default loginControllers;