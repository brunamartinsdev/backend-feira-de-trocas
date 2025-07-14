import prisma from "../models/prismaClient.js";
import cloudinary from '../config/cloudinaryConfig.js';

const getItens = async (request, response) => {
    const { categoria, busca } = request.query;
    const where = {};

    if (categoria) {
        where.categoria = String(categoria); //para filtrar por categoria
    }

    if (busca) { //para buscar por palavra-chave com nome ou descrição
        where.OR = [
            { nome: { contains: String(busca), mode: "insensitive" } }, //insensitive para ignorar maiúsculas e minúsculas
            { descricao: { contains: String(busca), mode: "insensitive" } },
            { categoria: { contains: String(busca), mode: "insensitive"}},
        ];
    }

    try {
        const itens = await prisma.item.findMany({
            where,
            include: { //para incluir os dados do dono do produto além do produto
                usuarioResponsavel: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                }
            }
        });
        return response.status(200).json(itens);
    } catch (error) {
        console.error("Erro ao buscar itens: ", error);
        return response.status(500).json({ error: "Erro interno ao buscar itens." });
    }
};

const getItemById = async (request, response) => {
    const { id } = request.params;
    try {
        const item = await prisma.item.findUnique({
            where: { id },
            include: {
                usuarioResponsavel: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                }
            }
        });

        if (!item) {
            return response.status(404).json({ error: "Item não encontrado." });
        }
        return response.status(200).json(item);
    } catch (error) {
        console.error("Erro ao buscar item por Id: ", error);
        return response.status(500).json({ error: "Erro interno ao buscar o item." });
    }
};

const createItem = async (request, response) => {
    const { nome, descricao, categoria, foto } = request.body;
    const usuarioResponsavelId = request.user.id; 

    try {
        const item = await prisma.item.create({
            data: {
                nome,
                descricao,
                categoria,
                status: "Disponível",
                foto,
                usuarioResponsavel: { connect: { id: usuarioResponsavelId } } //para conectar o item ao usuário
            }
        });
        return response.status(201).json(item);
    } catch (error) {
        console.error("Erro ao cadastrar item: ", error);
        return response.status(500).json({ error: "Erro interno ao cadastrar item." });
    }
};

const updateItem = async (request, response) => {
    const { id } = request.params;
    const { nome, descricao, categoria, status, foto } = request.body;
    const userIdFromToken = request.user.id;
    const isAdmin = request.user.isAdmin;

    try {
        const itemExiste = await prisma.item.findUnique({
            where: { id }
        });

        if (!itemExiste) {
            return response.status(404).json({ error: "Item não encontrado." });
        };

        if (itemExiste.usuarioResponsavelId !== userIdFromToken && !isAdmin) {
            return response.status(403).json({ error: "Você não tem permissão para atualizar este item." });
        }

        const itemAtualizado = await prisma.item.update({
            where: { id },
            data: { nome, descricao, categoria, status, foto }
        });
        return response.status(200).json(itemAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar item: ", error);
        if (error.code === 'P2025') { // código para registro não encontrado no Prisma
            return response.status(404).json({ error: "Item não encontrado" });
        }

        return response.status(500).json({ error: "Erro interno ao atualizar item" });
    }
};

const deleteItem = async (request, response) => {
    const { id } = request.params;
    const userIdFromToken = request.user.id;
    const isAdmin = request.user.isAdmin;

    try {
        const itemExiste = await prisma.item.findUnique({
            where: { id }
        });

        if (!itemExiste) {
            return response.status(404).json({ error: "Item não encontrado." });
        }

        if (itemExiste.usuarioResponsavelId !== userIdFromToken && !isAdmin) {
            return response.status(403).json({ error: "Você não tem permissão para excluir este item." });
        }

        //se o item tem uma foto, tenta deletá-la do Cloudinary
        if (itemExiste.foto) { //para verificar se a URL da foto existe
            try {
                const url = itemExiste.foto;
                //separa a URL para pegar o publicId da imagem
                const uploadIndex = url.lastIndexOf('/upload/'); //encontra a última vez que upload aparece
                const pontoIndex = url.lastIndexOf('.'); //encontra a posição do último ponto

                //verifica se /upload/ foi encontrado na URL e se o ponto da extensão vem depois do /upload/
                if (uploadIndex > -1 && pontoIndex > uploadIndex) {
                    //começa depois do texto /upload/
                    const caminhoCompleto = url.substring(uploadIndex + '/upload/'.length);

                    //divide o caminho usando a /
                    const partes = caminhoCompleto.split('/');

                    let publicIdParaExcluir; 

                    //verifica se tem a versão na URl
                    if (partes.length > 1 && partes[0].startsWith('v') && !isNaN(parseInt(partes[0].substring(1)))) {
                        publicIdParaExcluir = partes.slice(1).join('/').split('.')[0];
                    } else {
                        //se não tiver versão
                        publicIdParaExcluir = caminhoCompleto.split('.')[0]; 
                    }

                    //chama a API do Cloudinary para deletar a imagem
                    const cloudinaryDeleteResultado = await cloudinary.uploader.destroy(publicIdParaExcluir); 

                    if (cloudinaryDeleteResultado.result === 'ok') {
                    } else {
                        console.warn(`Aviso: Falha ao deletar imagem '${publicIdParaExcluir}' do Cloudinary:`, cloudinaryDeleteResultado.result);
                    }
                } else {
                    console.warn(`Aviso: URL de foto inválida ou não reconhecível para exclusão do Cloudinary: ${itemExiste.foto}`);
                }
            } catch (cloudinaryError) {
                console.error(`Erro ao tentar deletar imagem do Cloudinary para ${itemExiste.foto}:`, cloudinaryError.message);
            }
        }

        await prisma.item.delete({
            where: { id }
        });
        return response.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar item: ", error);
        if (error.code === 'P2003') { // Foreign Key Constraint Failed
            return response.status(409).json({
                error: "Não foi possível deletar o item. Ele pode estar envolvido em propostas de troca.",
                details: "Remova as propostas associadas a este item antes de tentar excluí-lo."
            });
        }
        if (error.code === 'P2025') {
            return response.status(404).json({ error: "Item não encontrado." });
        }
        return response.status(500).json({ error: "Erro interno ao deletar item." });
    }
};

const itensController = {
    getItens,
    getItemById,
    createItem,
    updateItem,
    deleteItem
};

export default itensController;