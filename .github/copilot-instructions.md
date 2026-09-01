# Instruções para GitHub Copilot

Antes de sugerir ou alterar código, siga `.github/AGENTS.md` integralmente, consulte `arch.md` para preservar a arquitetura e use `tasks.md` como roteiro executável.

Regras essenciais: código TypeScript/NestJS simples e legível; endpoints sob `/resources/v1/<resource>` com código em `src/resources/v1/<resource>/`; integrações, Prisma, providers e adapters em `src/infra/`; dados estruturados de Pokémon via PokéAPI e conhecimento textual via RAG; testes unitários e de integração para toda mudança de comportamento.
