# Instruções do projeto

Leia e siga integralmente `.github/AGENTS.md` antes de alterar este repositório. Use `arch.md` como referência da arquitetura e `tasks.md` como roteiro executável, ambos na raiz do projeto.

Em resumo: preserve código legível; mantenha endpoints em `/resources/v1/<resource>` e seus módulos em `src/resources/v1/<resource>/`; isole Prisma, serviços técnicos, providers e adapters em `src/infra/`; e acompanhe mudanças de comportamento com testes unitários e de integração.
