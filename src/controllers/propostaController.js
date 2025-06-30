import prisma from "../models/prismaClient.js";

const createProposta = async (request, response) => {
    const { itemOfertadoId, itemDesejadoId, quemFezId } = request.body;
    try {
        const [itemOfertado, itemDesejado, quemFez] = await prisma.$transaction([ //prisma.$transaction permite fazer várias operações no banco de dados
            prisma.item.findUnique({ where: { id: itemOfertadoId } }), //procura o item que o usuário está oferecendo
            prisma.item.findUnique({ where: { id: itemDesejadoId } }), //procura o item que o usuário quer receber
            prisma.usuario.findUnique({ where: { id: quemFezId } }) //procura usuário que está fazendo proposta
        ]);

        if (!itemOfertado || !itemDesejado || !quemFez) {
            return response.status(404).json({ error: "Item(ns) ou usuário não encontrado." });
        }

        if (itemOfertado.usuarioResponsavelId !== quemFezId) {
            return response.status(403).json({ error: "O item ofertado não pertence ao usuário que fez a proposta." });
        }

        if (itemDesejado.usuarioResponsavelId === quemFezId) {
            return response.status(400).json({ error: "Não é possível propor troca por um item seu." });
        }

        if (itemOfertado.status !== "Disponível" || itemDesejado.status !== "Disponível") {
            return response.status(400).json({ error: "Um dos itens envolvidos não está disponível para troca." });
        }

        const proposta = await prisma.proposta.create({
            data: {
                itemOfertado: { connect: { id: itemOfertadoId } },
                itemDesejado: { connect: { id: itemDesejadoId } },
                quemFez: { connect: { id: quemFezId } },
                status: "pendente"
            }
        });
        return response.status(201).json(proposta);
    } catch (error) {
        console.error("Erro ao criar proposta:", error);
        return response.status(500).json({ error: "Erro interno ao criar proposta." });
    }
};

const acceptProposta = async (request, response) => {
    const { id } = request.params;

    //adicionar autenticação e autorização do usuário para permitir que só o dono do item possa aceitar

    try {
        const proposta = await prisma.proposta.findUnique({
            where: { id },
            include: { itemOfertado: true, itemDesejado: true, quemFez: true }
        });

        if (!proposta) {
            return response.status(404).json({ error: "Proposta não encontrada." });
        }
        if (proposta.status !== "pendente") {
            return response.status(400).json({ error: "Esta proposta não está pendente e não pode ser aceita." });
        }

        const propostaAceita = await prisma.proposta.update({
            where: { id },
            data: { status: "aceita" }
        });

        await prisma.item.update({
            where: { id: proposta.itemOfertadoId },
            data: { status: "Trocado" }
        });

        await prisma.item.update({
            where: { id: proposta.itemDesejadoId },
            data: { status: "Trocado" }
        });
        return response.status(200).json(propostaAceita);
    } catch (error) {
        console.error("Erro ao aceitar proposta:", error);
        return response.status(500).json({ error: "Erro interno ao aceitar proposta." });
    }
};

const refuseProposta = async (request, response) => {
    const { id } = request.params;

    //adicionar autenticação e autorização aqui também

    try {
        const proposta = await prisma.proposta.findUnique({
            where: { id },
            include: { itemDesejado: true }
        });

        if (!proposta) {
            return response.status(404).json({ error: "Proposta não encontrada." });
        }
        if (proposta.status !== "pendente") {
            return response.status(400).json({ error: "Esta proposta não está pendente e não pode ser recusada." });
        }

        const propostaRecusada = await prisma.proposta.update({
            where: { id },
            data: { status: "recusada" }
        });
        return response.status(200).json(propostaRecusada);
    } catch (error) {
        console.error("Erro ao recusar proposta:", error);
        return response.status(500).json({ error: "Erro interno ao recusar proposta." });
    }
};

const getPropostas = async (request, response) => {
    const { status, quemFezId, itemDesejadoId } = request.query;
    const where = {};

    if (status) {
        where.status = String(status);
    }
    if (quemFezId) {
        where.quemFezId = String(quemFezId);
    }
    if (itemDesejadoId) {
        where.itemDesejadoId = String(itemDesejadoId);
    }

    try {
        const propostas = await prisma.proposta.findMany({
            where,
            include: {
                itemOfertado: { select: { id: true, nome: true, categoria: true, usuarioResponsavelId: true } },
                itemDesejado: { select: { id: true, nome: true, categoria: true, usuarioResponsavelId: true } },
                quemFez: { select: { id: true, nome: true, email: true } }
            }
        });
        return response.status(200).json(propostas);
    } catch (error) {
        console.error("Erro ao listar propostas:", error);
        return response.status(500).json({ error: "Erro interno ao listar propostas." });
    }
};

const getPropostaById = async (request, response) => {
    const { id } = request.params;
    try {
        const proposta = await prisma.proposta.findUnique({
            where: { id },
            include: {
                itemOfertado: true,
                itemDesejado: true,
                quemFez: true
            }
        });
        if (!proposta) {
            return response.status(404).json({ error: "Proposta não encontrada." });
        }
        return response.status(200).json(proposta);
    } catch (error) {
        console.error("Erro ao buscar proposta:", error);
        return response.status(500).json({ error: "Erro interno ao buscar proposta." });
    }
};

const propostasController = {
    createProposta,
    acceptProposta,
    refuseProposta,
    getPropostas,
    getPropostaById
};

export default propostasController;