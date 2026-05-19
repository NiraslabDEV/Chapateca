---
name: Chapateca Portal — Contexto do Projeto
description: Stack, arquitetura e estado actual do portal interno da Chapateca
type: project
---

Portal interno Next.js para a Chapateca (ONG moçambicana de bibliotecas comunitárias em Maputo).

**Why:** Cliente real de Gabriel — reunião de demo prevista para esta semana. Objectivo é fechar contrato mostrando o MVP funcional.

**Stack:** Next.js App Router + Tailwind + Shadcn/ui + Postgres/Prisma + NextAuth (Google OAuth @chapateca.org) + Google Drive API v3

**Arquitectura chave:** Google Drive é o storage real; Postgres guarda apenas metadados (FileLog) e controlo de roles. O backend determina automaticamente a pasta do Drive pelo `category` do upload.

**Roles:** DIRECAO (tudo) > DAF (financeiro) > COMUNICACAO (galeria) > CAMPO (galeria)

**Fase 1 MVP:** Auth + Galeria/Upload de fotos + Geração de links partilháveis

**Pasta `sistema/`:** Protótipo HTML/Babel do UI — referência visual, não é a base do código final.

**How to apply:** Sempre seguir o CLAUDE.md na raiz do projeto para decisões técnicas. O MVP foca no módulo de fotos primeiro.
