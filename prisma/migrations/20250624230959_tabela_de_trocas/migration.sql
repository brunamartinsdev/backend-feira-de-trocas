-- CreateTable
CREATE TABLE "cadastro" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(30) NOT NULL,
    "email" VARCHAR(30) NOT NULL,

    CONSTRAINT "cadastro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itenscad" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(30) NOT NULL,
    "descricao" TEXT,
    "categoria" VARCHAR(30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Disponível',

    CONSTRAINT "itenscad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposta" (
    "id" TEXT NOT NULL,
    "itemOfertadoId" TEXT NOT NULL,
    "itemDesejadoId" TEXT NOT NULL,
    "quemFezId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',

    CONSTRAINT "proposta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cadastro_email_key" ON "cadastro"("email");

-- AddForeignKey
ALTER TABLE "proposta" ADD CONSTRAINT "proposta_itemOfertadoId_fkey" FOREIGN KEY ("itemOfertadoId") REFERENCES "itenscad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposta" ADD CONSTRAINT "proposta_itemDesejadoId_fkey" FOREIGN KEY ("itemDesejadoId") REFERENCES "itenscad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposta" ADD CONSTRAINT "proposta_quemFezId_fkey" FOREIGN KEY ("quemFezId") REFERENCES "cadastro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
