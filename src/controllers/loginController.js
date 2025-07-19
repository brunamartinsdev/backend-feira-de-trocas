import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";
import bcrypt from 'bcryptjs';
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

const login = async (req, res) => {
    const { email, senha } = req.body;
    try {
        const user = await prisma.Usuario.findUnique({
            where: { email },
            select: {
                id: true,
                nome: true,
                email: true,
                senha: true,
                isAdmin: true,
            },
        });

        if (!user || !user.senha) {
            return res.status(401).json({ message: "Email ou senha inválidos" });
        }

        const userValid = await bcrypt.compare(senha, user.senha);
        if (!userValid) {
            return res.status(401).json({ message: "Email ou senha inválidos" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                nome: user.nome, isAdmin: user.isAdmin,
            },
            SECRET_KEY,
            {
                expiresIn: "1h",
            }
        );

        const { senha: _, ...userWithoutPassword } = user;


        const usuarioFormatado = {
            id: userWithoutPassword.id,
            nome: userWithoutPassword.nome,
            email: userWithoutPassword.email,
            isAdmin: userWithoutPassword.isAdmin
        };

        return res.json({ token, usuario: usuarioFormatado });

    } catch (error) {
        console.error("Erro no login:", error);
        return res.status(500).json({ message: "Erro interno no servidor" });
    }
};


// Middleware para auntenticar o token
const authenticateToken = (req, res, next) => {
    //rotas que não precisam de autenticação para serem acessadas
    if (req.path === '/usuarios' && req.method === 'POST') {
        return next();
    }
    if (req.path === '/usuarios' && req.method === 'GET') {
        return next();
    }
    if (req.path.startsWith('/usuarios/') && req.method === 'GET') {
        return next();
    }
    if (req.path === '/itens' && req.method === 'GET') {
        return next();
    }
    if (req.path.startsWith('/itens/') && req.method === 'GET') {
        return next();
    }
    if (req.path === '/categorias' && req.method === 'GET') {
        return next();
    }

    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Formato de token inválido! Use \'Bearer <token>\'.' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido ou expirado.' });
        }
        req.user = user;

        next();
    });
};

const loginControllers = {
    login,
    authenticateToken,
};

export default loginControllers;