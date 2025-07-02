import cloudinary from '../config/cloudinaryConfig.js';

export const uploadImage = async (request, response) => {
    console.log("Entering uploadImage controller.");
    console.log("request.file (in controller):", request.file);
    console.log("request.files (in controller):", request.files);
    try {
        if (!request.file) { //request.file.buffer contém o buffer da imagem 
            return response.status(400).json({ error: "Nenhum arquivo de imagem foi enviado." });
        }

        //'uploadStream' para enviar o buffer diretamente
        const result = await cloudinary.uploader.upload_stream(
            { resource_type: "image", folder: "feira-de-trocas-itens" },
            (error, result) => {
                if (error) {
                    console.error("Erro no upload para Cloudinary:", error);
                    return response.status(500).json({ error: "Falha ao enviar imagem para o Cloudinary." });
                }

                response.status(200).json({
                    message: "Imagem enviada com sucesso!",
                    imageUrl: result.secure_url, //'result.secure_url' é a URL da imagem
                    publicId: result.public_id
                });
            }
        ).end(request.file.buffer); //envia o buffer da imagem para o Cloudinary
    } catch (error) {
        console.error("Erro no processamento do upload:", error);
        return response.status(500).json({ error: "Erro interno do servidor ao processar o upload da imagem." });
    }
};
