# Instruções para agentes de código

Estas regras valem para todo o repositório. Antes de implementar uma mudança, leia também `arch.md`, na raiz do projeto, que é a fonte de verdade para o objetivo do produto, e `tasks.md`, que define a ordem executável, dependências, responsáveis e critérios de aceite.

## Princípios de trabalho

- Preserve o comportamento existente e faça mudanças pequenas, coesas e fáceis de revisar.
- Priorize código legível e explícito: nomes em inglês que revelem intenção, funções curtas, fluxo simples e responsabilidades bem delimitadas.
- Não crie abstrações, camadas, dependências ou configurações para uma necessidade apenas hipotética. A arquitetura deve crescer junto com funcionalidades reais.
- Não implemente itens futuros do roteiro de `arch.md` sem que a tarefa atual os exija.
- Ao trabalhar no roadmap, atualize o status da tarefa correspondente em `tasks.md`; não marque uma tarefa como concluída antes de executar seus critérios de aceite e registrar pendências relevantes.
- Reutilize os padrões já presentes antes de introduzir um padrão novo. Quando uma decisão arquitetural nova for necessária, registre-a objetivamente na documentação relevante.
- Não altere segredos ou versiona arquivos `.env`. Forneça apenas exemplos sem valores sensíveis quando necessário.

## Stack e padrões gerais

- Use Node.js, TypeScript e NestJS conforme as versões declaradas em `package.json`.
- Prefira injeção de dependência do NestJS a instâncias globais ou `new` espalhado pelo código.
- Use tipos específicos nas fronteiras. Evite `any`, type assertions sem justificativa e objetos de formato implícito.
- Trate erros no limite que tem contexto para traduzi-los. Não silencie exceções e não exponha detalhes internos, credenciais ou respostas brutas de terceiros ao cliente.
- Não bloqueie o event loop com trabalho síncrono pesado. Trate Promises explicitamente e aguarde operações assíncronas.
- Use configuração por ambiente e valide configurações obrigatórias na inicialização. Nunca embuta URLs, tokens ou credenciais de produção no código.
- Registre eventos úteis e estruturados, sem dados sensíveis. Evite `console.log` como solução permanente em código de aplicação.
- Rode o formatter e o linter configurados no projeto; não imponha um estilo paralelo ao Prettier/ESLint existente.

## Organização HTTP e de recursos

Novos endpoints versionados devem ser expostos em:

```text
/resources/v1/<resource>
```

Organize cada recurso dentro de `src/resources/v1/<resource>/`, usando nomes em `kebab-case` para diretórios e rotas. Mantenha juntos os elementos que pertencem ao recurso, sem criar pastas vazias:

```text
src/
├── app.module.ts
├── resources/
│   └── v1/
│       └── pokemon/
│           ├── pokemon.module.ts
│           ├── pokemon.controller.ts
│           ├── pokemon.service.ts
│           └── dto/
└── infra/
    ├── database/
    │   └── prisma/
    ├── providers/
    ├── services/
    └── adapters/
```

Esse desenho é uma referência, não uma obrigação de criar todas as pastas. O recurso deve começar com a menor estrutura que mantenha suas responsabilidades claras.

- Não configure prefixo global. Cada controller deve declarar explicitamente sua rota completa como `@Controller('v1/<resource>')`, mantendo o versionamento visível no próprio resource. Se isso alterar rotas existentes, faça a migração de forma explícita e atualize os testes.
- Controllers cuidam apenas do protocolo HTTP: entrada, validação, autenticação/autorização quando aplicável, chamada da camada responsável e mapeamento da resposta.
- Services do recurso orquestram o caso de uso. Eles não devem conhecer detalhes de HTTP nem acessar clientes externos ou Prisma diretamente quando isso acoplar regra de aplicação à infraestrutura.
- Use DTOs nas entradas e saídas públicas. Não retorne entidades do Prisma ou payloads de fornecedores diretamente pela API.
- Módulos registram somente controllers e providers de que precisam; evite módulos globais sem necessidade comprovada.
- Não mova os arquivos starter da raiz de `src/` apenas para adequação estética. Migre-os quando uma funcionalidade ou mudança de rota justificar isso.

## Camada `infra`

Coloque em `src/infra/` detalhes técnicos e integrações externas, como:

- cliente e repositórios Prisma;
- acesso à PokéAPI;
- Ollama e LangChain;
- embeddings e pgvector;
- providers, adapters, gateways e serviços técnicos compartilhados.

Exponha esses detalhes por contratos pequenos quando isso reduzir acoplamento ou facilitar testes. Não crie uma interface para cada classe automaticamente.

- Código de domínio ou orquestração de um único recurso permanece no próprio recurso.
- Integrações devem definir timeout, traduzir falhas externas para erros da aplicação e retornar somente os dados necessários.
- O `PokemonService` descrito em `arch.md` é a fronteira da PokéAPI; sua implementação técnica pode ficar em `infra/providers/pokeapi/` e ser injetada no recurso consumidor.
- `LlmService` não acessa PokéAPI ou banco diretamente. `RagService` recupera conhecimento. `IngestionService` trata leitura, chunking, embeddings e persistência. `ChatService` orquestra essas capacidades.
- Dados objetivos de Pokémon vêm preferencialmente da PokéAPI. Conteúdo textual, regras e guias usam RAG. Não duplique dados estruturados em embeddings sem uma razão documentada.
- Quando uma fonte não fornecer evidência suficiente, retorne uma limitação explícita em vez de inventar dados.

## Prisma e PostgreSQL

- O schema fica em `prisma/schema.prisma`; configuração e URL do datasource ficam em `prisma.config.ts`; o client gerado fica em `generated/prisma/` e nunca deve ser editado ou versionado manualmente.
- Mantenha `prisma` e `@prisma/client` fixados na mesma versão. O projeto usa Prisma 7.10.0 e o generator `prisma-client`; importe o client do caminho gerado quando o `PrismaService` for implementado.
- Toda instanciação de `PrismaClient` deve receber um driver adapter compatível, como `@prisma/adapter-pg`; não coloque `url` no datasource de `schema.prisma`.
- O override de `deepmerge-ts` para 8.0.2 corrige GHSA-ggr8-5vv4-36mx. Remova-o somente quando `@prisma/config` adotar uma versão corrigida e `npm audit` continuar limpo sem o override.
- Mantenha Prisma e consultas dentro da infraestrutura. Controllers não fazem consultas, e detalhes de persistência não devem vazar para respostas HTTP.
- Modele nomes e relações de forma clara. Inclua constraints, índices e unicidade coerentes com as regras de negócio.
- Se mudar o schema, inclua uma migration com nome descritivo e regenere o client. Não reescreva migrations já aplicadas sem solicitação explícita.
- Evite consultas N+1 e carregamento excessivo. Use `select`/`include` deliberadamente e paginação para coleções potencialmente grandes.
- Use transações quando uma operação precisar ser atômica. Não abra transações longas ao redor de chamadas de rede ou do LLM.
- Isole SQL bruto em um repository/provider de infraestrutura, sempre parametrizado. Isso é especialmente importante para operações com pgvector.
- A dimensão de `vector` deve corresponder exatamente ao modelo de embeddings configurado; nunca escolha um tamanho arbitrário.
- Testes não devem depender do banco de desenvolvimento. Use um banco de teste isolado e limpeza determinística quando a integração real com PostgreSQL for necessária.

## Tools, LLM e RAG

- Tools devem ter entrada e saída tipadas, descrição clara e payload enxuto.
- O LLM decide quando chamar Tools; não simule intenção com condicionais frágeis baseadas em palavras da mensagem.
- Não envie respostas completas da PokéAPI ou documentos inteiros ao modelo quando um subconjunto é suficiente.
- Preserve a origem dos chunks e, quando disponível, o score de recuperação para permitir respostas fundamentadas.
- Torne modelo de chat, modelo de embeddings, limites de chunk, `topK`, URLs e timeouts configuráveis.
- Em testes automatizados, não dependa de rede, PokéAPI ou Ollama reais, exceto em uma suíte de integração explicitamente preparada para isso.

## Testes obrigatórios

Toda mudança de comportamento deve incluir ou atualizar testes unitários e testes de integração. Para endpoints, inclua também cobertura HTTP e2e quando ela for a forma mais fiel de validar o contrato.

- Testes unitários ficam próximos ao código como `*.spec.ts` e isolam dependências externas com doubles simples e tipados.
- Testes de integração ficam em `test/integration/` como `*.integration-spec.ts` e validam a colaboração real entre módulos ou adapters relevantes.
- Testes HTTP e2e ficam em `test/` como `*.e2e-spec.ts`, usando o app Nest e Supertest.
- Cubra caminho feliz, validação, erros relevantes e casos de borda. Teste comportamento observável, não detalhes privados de implementação.
- Evite snapshots grandes, temporizadores reais, ordem implícita e dados aleatórios sem seed.
- Para mudanças somente em documentação ou configuração sem comportamento executável, não crie testes artificiais; registre no resumo que os testes não se aplicam.
- Antes de concluir uma implementação, execute no mínimo os testes afetados. Quando viável, execute `npm test`, `npm run test:e2e`, `npm run lint` e `npm run build`.

## Critérios de conclusão

Uma mudança está pronta quando:

- respeita `arch.md` e estas instruções;
- mantém as responsabilidades separadas e o código legível;
- inclui testes unitários e de integração aplicáveis;
- não expõe segredos nem adiciona dependências sem justificativa;
- passa nos testes, lint e build relevantes;
- documenta mudanças de contrato, configuração, migration ou decisão arquitetural.
