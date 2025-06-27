-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(30) NOT NULL,
    "email" VARCHAR(30) NOT NULL,
    "senha" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(30) NOT NULL,
    "descricao" TEXT,
    "categoria" VARCHAR(30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Disponível',
    "foto" TEXT,
    "usuarioResponsavelId" TEXT NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposta" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "itemOfertadoId" TEXT NOT NULL,
    "itemDesejadoId" TEXT NOT NULL,
    "quemFezId" TEXT NOT NULL,

    CONSTRAINT "Proposta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_usuarioResponsavelId_fkey" FOREIGN KEY ("usuarioResponsavelId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_itemOfertadoId_fkey" FOREIGN KEY ("itemOfertadoId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_itemDesejadoId_fkey" FOREIGN KEY ("itemDesejadoId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_quemFezId_fkey" FOREIGN KEY ("quemFezId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
