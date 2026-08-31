# Instruções do projeto

Leia e siga integralmente `AGENTS.md` antes de alterar este repositório. Use `arch.md` como referência obrigatória para a arquitetura do produto, responsabilidades de PokéAPI/Tools/RAG e evolução incremental.

Em resumo: preserve código legível; mantenha endpoints em `/resources/v1/<resource>` e seus módulos em `src/resources/v1/<resource>/`; isole Prisma, serviços técnicos, providers e adapters em `src/infra/`; e acompanhe mudanças de comportamento com testes unitários e de integração.
