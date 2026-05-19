# Portal Digital Chapateca — Diretrizes de Desenvolvimento

## Visão Geral
Portal administrativo interno para centralizar a operação da Chapateca (ONG moçambicana de bibliotecas comunitárias). Abstrai o Google Drive como storage, controlando permissões por role via Postgres.

## Stack
- **Frontend/Backend:** Next.js (App Router)
- **UI:** Tailwind CSS + Shadcn/ui (Mobile-First)
- **Base de dados:** PostgreSQL via Prisma ORM
- **Autenticação:** NextAuth.js — Google OAuth restrito a `@chapateca.org`
- **Storage:** Google Drive API v3 (Service Account)

## Roles de Acesso
| Role | Módulos acessíveis |
|---|---|
| `DIRECAO` | Tudo |
| `DAF` | Financeiro, Procedimentos |
| `COMUNICACAO` | Galeria, Procedimentos |
| `CAMPO` | Galeria, Procedimentos |

## Modelo de Dados (Prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  DIRECAO
  DAF
  COMUNICACAO
  CAMPO
}

model User {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique // deve terminar em @chapateca.org
  image     String?
  role      Role      @default(CAMPO)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  uploads   FileLog[]
}

model FileLog {
  id            String    @id @default(cuid())
  googleDriveId String    @unique
  fileName      String
  fileType      String    // IMAGE | VIDEO | PDF | DOCX | XLSX
  category      String    // FOTOS_TERRENO | FINANCEIRO | ESTRATEGIA | PROCEDIMENTOS
  location      String?   // ex: "Malhangalene", "Matola"
  activityDate  DateTime?
  uploadedById  String
  uploadedBy    User      @relation(fields: [uploadedById], references: [id])
  createdAt     DateTime  @default(now())
}
```

## Estrutura de Pastas no Google Drive

```
[Raiz Drive Chapateca]
├── 01. Procedimentos Internos       → todos os roles
├── 02. Estrategia e Direcao         → DIRECAO
├── 03. Financeiro e Contabilidade   → DAF, DIRECAO
└── 04. Comunicacao e Terreno        → CAMPO, COMUNICACAO, DIRECAO
    └── [Ano]                        → criado auto
        └── [MM_Mes]                 → criado auto
```

O backend determina a pasta correta pelo `category` do upload — o utilizador nunca escolhe a pasta.

## Rotas de API (Next.js App Router)

```
POST /api/upload          → recebe ficheiro, faz upload ao Drive, regista FileLog
GET  /api/files           → lista FileLog com filtros (categoria, role, data)
POST /api/share/[fileId]  → gera link público temporário via Drive API
GET  /api/auth/[...nextauth] → NextAuth handler
```

## Regras de Desenvolvimento
- Validar sempre que o email termina em `@chapateca.org` no callback do NextAuth
- O acesso a módulos é verificado no middleware Next.js pelo role do User no Postgres
- Nunca expor o `googleDriveId` directamente ao frontend — usar o ID interno do FileLog
- Pastas do Drive são criadas automaticamente se não existirem (criar antes de fazer upload)
- Links de partilha são gerados via `permissions.create` com `role: reader` e `type: anyone`

## Fase 1 — MVP Demo (Esta Semana)
- [ ] Setup: Next.js + Tailwind + Shadcn + Prisma + Postgres
- [ ] Auth: NextAuth com Google OAuth + validação @chapateca.org
- [ ] Módulo Galeria: ecrã de listagem de álbuns por mês/local
- [ ] Upload: rota `/api/upload` → Drive → FileLog
- [ ] Links: rota `/api/share/[fileId]` → link temporário partilhável

## Contexto do Cliente
- **Nome:** Chapateca
- **Tipo:** Associação sem fins lucrativos — Maputo, Moçambique
- **Missão:** Bibliotecas comunitárias em zonas carenciadas
- **Contacto:** info.chapateca@gmail.com / +258 84 149 9012
- **Endereço:** Av. Acordos de Lusaka, 147 - 1º D, Malhangalene, Maputo
- **Website:** www.chapateca.org (em breve — oportunidade)
- **Redes:** @chapateca (Instagram/Facebook)
- **ODS:** 1, 4, 5, 8, 10

## Protótipo de Referência
A pasta `sistema/` contém um protótipo HTML/Babel (sem build) que ilustra o UI/UX pretendido.
Serve como referência visual — **não** é a base de código do projeto final.
