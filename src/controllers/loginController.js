import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";

const SECRET_KEY = "admin123"; // adicionar o bcrypt depois

const login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const user = await prisma.Usuario.findUnique({
      where: { email },
    });

    if (!user || user.senha !== senha) {
      return res.status(401).json({ message: "Email ou senha inválidos" });
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

const loginControllers = {
  login,
};

export default loginControllers;