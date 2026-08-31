# Pokémon AI Assistant — RAG + Tools

## 1. Objetivo

Criar uma API em **NestJS** que disponibilize um chat inteligente especializado em Pokémon.

O usuário poderá fazer perguntas em linguagem natural, como:

- Qual é o tipo do Bulbasaur?
- Quais são os stats do Squirtle?
- Bulbasaur é mais forte que Squirtle?
- Qual Pokémon possui vantagem contra Blastoise?
- Quais são as evoluções do Charmander?
- Como funciona o sistema de batalha?
- Considerando as regras do servidor, Bulbasaur seria melhor que Squirtle?
- Monte um time de Pokémon da primeira geração para enfrentar determinado time.

O sistema não deve depender apenas do conhecimento interno do LLM.

Ele deverá buscar informações utilizando **Tools** e **RAG** antes de produzir respostas quando dados externos forem necessários.

---

# 2. Stack

## Backend

- Node.js
- TypeScript
- NestJS

## LLM

- Ollama
- LangChain.js

O Ollama será utilizado inicialmente para executar os modelos localmente.

Exemplo de modelo de chat:

```text
llama3.2
```

O modelo poderá ser alterado posteriormente.

## Embeddings

Inicialmente utilizar:

```text
nomic-embed-text
```

executado através do Ollama.

## Banco

PostgreSQL + pgvector.

O PostgreSQL armazenará:

- documentos;
- chunks;
- embeddings;
- metadados;
- futuramente histórico de conversas.

O pgvector será responsável pela busca vetorial utilizada pelo RAG.

## Dados Pokémon

Utilizar:

```text
PokéAPI
https://pokeapi.co/api/v2/
```

A PokéAPI será utilizada para informações estruturadas e oficiais dos Pokémon.

---

# 3. Arquitetura conceitual

```text
                    Usuário
                       │
                       ▼
                  ChatController
                       │
                       ▼
                   ChatService
                       │
                       ▼
                 LangChain / LLM
                       │
            identifica o que precisa
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
      Pokémon Tool   RAG Tool    Outras Tools
          │            │
          ▼            ▼
       PokéAPI      PostgreSQL
                    + pgvector
          │            │
          └──────┬─────┘
                 │
                 ▼
                LLM
                 │
                 ▼
              Resposta
```

---

# 4. Conceitos importantes

O sistema terá duas fontes principais de conhecimento.

## 4.1 Dados estruturados

Informações que podem ser consultadas diretamente através da PokéAPI.

Exemplos:

- Pokémon;
- tipos;
- stats;
- habilidades;
- golpes;
- evoluções;
- espécies;
- peso;
- altura;
- geração.

Exemplo:

```text
Qual o Attack do Charizard?
```

Fluxo esperado:

```text
Usuário
   ↓
LLM
   ↓
getPokemon("charizard")
   ↓
PokéAPI
   ↓
dados do Charizard
   ↓
LLM
   ↓
Resposta
```

O LLM não deve inventar o valor do Attack.

Sempre que possível, dados objetivos deverão vir da API.

---

# 5. RAG

RAG significa:

```text
Retrieval-Augmented Generation
```

Será utilizado para conhecimento textual que não está disponível diretamente através da PokéAPI.

Exemplos:

- regras personalizadas;
- documentação;
- mecânicas;
- guias;
- informações específicas do servidor;
- sistemas próprios;
- conteúdo adicional.

Exemplo de documento:

```text
docs/
└── battle.md
```

Conteúdo:

```md
# Sistema de batalha

Pokémon com vantagem de tipo recebem um multiplicador
de 1.5x no dano.

Ataques críticos causam 1.75x de dano.

Pokémon derrotados não recebem experiência.
```

---

# 6. Processo de ingestão

Os documentos deverão passar pelo seguinte processo:

```text
Documento
   ↓
Leitura
   ↓
Chunking
   ↓
Embedding
   ↓
PostgreSQL + pgvector
```

Exemplo:

```text
battle.md
```

poderá virar:

```text
Chunk 1
"Pokémon com vantagem de tipo recebem..."

Chunk 2
"Ataques críticos causam..."

Chunk 3
"Pokémon derrotados não recebem..."
```

Cada chunk possuirá seu próprio embedding.

---

# 7. Estrutura conceitual de um documento

Um chunk deverá possuir pelo menos:

```ts
{
    id: string;

    content: string;

    source: string;

    embedding: number[];
}
```

Posteriormente poderão ser adicionados metadados:

```ts
{
    id: string;

    content: string;

    source: string;

    category: string;

    metadata: Record<string, unknown>;

    embedding: number[];
}
```

---

# 8. Busca vetorial

Quando o usuário fizer uma pergunta relacionada ao conhecimento interno:

```text
Como funciona vantagem de tipo no servidor?
```

O fluxo será:

```text
Pergunta
   ↓
Ollama Embeddings
   ↓
Embedding da pergunta
   ↓
pgvector
   ↓
Busca por similaridade
   ↓
Top K chunks
   ↓
LLM
   ↓
Resposta
```

Exemplo conceitual:

```text
"Como funciona vantagem de tipo?"

↓

[0.12, -0.54, 0.87, ...]

↓

PostgreSQL

↓

3 chunks semanticamente mais próximos
```

Esses chunks serão enviados como contexto para o LLM.

---

# 9. Tools

O LLM terá acesso a ferramentas.

Inicialmente deverão existir ferramentas semelhantes a:

```text
getPokemon
searchKnowledge
```

Posteriormente:

```text
getPokemon
getPokemonMoves
getPokemonEvolution
getPokemonSpecies
getType
comparePokemon
searchKnowledge
```

---

# 10. Tool — getPokemon

Responsabilidade:

Consultar informações de um Pokémon através da PokéAPI.

Exemplo:

```text
getPokemon("bulbasaur")
```

Internamente:

```text
GET https://pokeapi.co/api/v2/pokemon/bulbasaur
```

Deverá retornar apenas informações relevantes para o LLM.

Evitar enviar a resposta inteira da PokéAPI desnecessariamente.

Exemplo:

```ts
{
    name: 'bulbasaur',

    types: [
        'grass',
        'poison'
    ],

    stats: {
        hp: 45,
        attack: 49,
        defense: 49,
        specialAttack: 65,
        specialDefense: 65,
        speed: 45
    }
}
```

---

# 11. Tool — searchKnowledge

Responsabilidade:

Pesquisar conhecimento armazenado no pgvector.

Exemplo:

```text
searchKnowledge(
    "vantagem de tipo em batalha"
)
```

Fluxo:

```text
texto
 ↓
embedding
 ↓
pgvector
 ↓
similaridade
 ↓
Top K chunks
```

Retorno conceitual:

```ts
[
    {
        content:
            'Pokémon com vantagem de tipo recebem 1.5x de dano.',

        source:
            'battle.md',

        score:
            0.91
    }
]
```

---

# 12. Perguntas que exigem múltiplas Tools

O sistema deverá permitir que o modelo utilize mais de uma ferramenta para responder uma pergunta.

Exemplo:

```text
Considerando as regras do servidor,
Bulbasaur é melhor que Squirtle?
```

Fluxo esperado:

```text
                    LLM
                     │
        ┌────────────┼─────────────┐
        ▼            ▼             ▼
 getPokemon      getPokemon   searchKnowledge
 ("bulbasaur")   ("squirtle") ("battle rules")
        │            │             │
        ▼            ▼             ▼
      PokéAPI      PokéAPI      pgvector
        │            │             │
        └────────────┼─────────────┘
                     ▼
                    LLM
                     │
                     ▼
                  Resposta
```

---

# 13. Exemplo de comparação

Pergunta:

```text
Bulbasaur é mais forte que Squirtle?
```

O sistema deverá buscar os dois Pokémon.

Exemplo:

```text
Bulbasaur

HP: 45
Attack: 49
Defense: 49
Special Attack: 65
Special Defense: 65
Speed: 45
```

```text
Squirtle

HP: 44
Attack: 48
Defense: 65
Special Attack: 50
Special Defense: 64
Speed: 43
```

O LLM receberá esses dados e deverá explicar que "mais forte" depende do critério.

Também poderá considerar:

- tipos;
- vantagem de tipo;
- stats;
- golpes;
- regras específicas.

---

# 14. Estrutura inicial do NestJS

A estrutura deverá começar simples.

```text
src/
├── app.module.ts
│
├── chat/
│   ├── chat.module.ts
│   ├── chat.controller.ts
│   └── chat.service.ts
│
├── pokemon/
│   ├── pokemon.module.ts
│   └── pokemon.service.ts
│
├── rag/
│   ├── rag.module.ts
│   ├── rag.service.ts
│   └── ingestion.service.ts
│
└── llm/
    ├── llm.module.ts
    └── llm.service.ts
```

Não criar abstrações adicionais sem necessidade.

O projeto deverá crescer conforme as funcionalidades forem implementadas.

---

# 15. Responsabilidades

## PokemonService

Responsável exclusivamente pela comunicação com a PokéAPI.

Exemplo:

```ts
getPokemon(name: string)
```

Posteriormente:

```ts
getPokemon(name: string)

getMoves(name: string)

getEvolution(name: string)

getSpecies(name: string)

getType(name: string)
```

---

## LlmService

Responsável pela comunicação com Ollama através do LangChain.

Não deverá conhecer detalhes da PokéAPI.

Não deverá acessar diretamente o banco.

---

## RagService

Responsável pela recuperação de conhecimento.

Exemplo:

```ts
search(query: string)
```

Responsabilidades:

```text
query
 ↓
embedding
 ↓
pgvector
 ↓
similaridade
 ↓
chunks
```

---

## IngestionService

Responsável pela entrada de conhecimento no RAG.

Fluxo:

```text
arquivo
 ↓
leitura
 ↓
chunking
 ↓
embeddings
 ↓
persistência
```

---

## ChatService

Será responsável por orquestrar a conversa.

Deverá permitir que o LLM utilize as Tools disponíveis.

Não deverá implementar manualmente regras como:

```ts
if (message.includes('pikachu')) {
    ...
}
```

A intenção da pergunta deverá ser interpretada pelo modelo através de Tool Calling sempre que possível.

---

# 16. Banco de dados

Utilizar:

```text
PostgreSQL
+
pgvector
```

A extensão deverá ser habilitada:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Estrutura conceitual inicial:

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY,

    content TEXT NOT NULL,

    source VARCHAR(255),

    embedding VECTOR(...)
);
```

A dimensão do vetor deverá ser definida de acordo com o modelo de embeddings escolhido.

Não definir arbitrariamente a dimensão.

Ela deverá corresponder exatamente ao embedding produzido pelo modelo.

---

# 17. Ollama

O Ollama terá inicialmente duas responsabilidades.

## Chat

Executar o LLM utilizado pelo LangChain.

Exemplo:

```text
llama3.2
```

## Embeddings

Transformar textos em vetores.

Inicialmente:

```text
nomic-embed-text
```

Fluxo:

```text
"Pikachu é um Pokémon elétrico"

↓

Ollama Embeddings

↓

[
    0.124,
    -0.532,
    0.812,
    ...
]
```

---

# 18. Regras importantes do projeto

## Não confiar no conhecimento interno do LLM para dados objetivos

Sempre que uma Tool possuir o dado necessário, ela deverá ser utilizada.

Evitar:

```text
LLM → responde de memória
```

Preferir:

```text
LLM
 ↓
Tool
 ↓
fonte
 ↓
LLM
 ↓
resposta
```

---

## Não transformar tudo em RAG

Dados estruturados devem preferencialmente vir de APIs ou banco estruturado.

Exemplo:

```text
Attack do Pikachu
```

deve vir da PokéAPI.

Não é necessário criar embeddings para esse tipo de informação.

---

## RAG para conhecimento textual

Utilizar pgvector principalmente para:

- documentação;
- regras;
- guias;
- sistemas personalizados;
- conteúdo não estruturado.

---

## Evitar respostas inventadas

Quando nenhuma Tool ou documento possuir informação suficiente, o modelo deverá informar que não possui dados suficientes.

Não deverá inventar informações para completar a resposta.

---

# 19. Ordem de implementação

O projeto deverá ser construído incrementalmente.

## Etapa 1

Criar projeto NestJS.

## Etapa 2

Configurar Ollama.

Objetivo:

```text
NestJS
 ↓
Ollama
 ↓
Resposta
```

## Etapa 3

Criar `PokemonService`.

Objetivo:

```text
NestJS
 ↓
PokéAPI
 ↓
Pokemon
```

## Etapa 4

Transformar `PokemonService` em uma Tool disponível para o LLM.

Objetivo:

```text
"Qual o Attack do Pikachu?"

↓

LLM

↓

getPokemon("pikachu")

↓

PokéAPI

↓

LLM

↓

Resposta
```

## Etapa 5

Configurar PostgreSQL + pgvector.

## Etapa 6

Criar embeddings utilizando Ollama.

## Etapa 7

Salvar primeiro documento e embedding.

## Etapa 8

Implementar busca por similaridade.

## Etapa 9

Criar `searchKnowledge` como Tool.

## Etapa 10

Permitir múltiplas Tools na mesma pergunta.

Exemplo:

```text
Bulbasaur é melhor que Squirtle
considerando as regras do servidor?
```

## Etapa 11

Adicionar histórico de conversa.

## Etapa 12

Adicionar streaming das respostas.

---

# 20. Objetivo didático

Este projeto também possui finalidade de aprendizado.

Portanto:

- implementar uma funcionalidade por vez;
- evitar abstrações prematuras;
- explicar o motivo de cada implementação;
- evitar código mágico;
- evitar adicionar bibliotecas desnecessárias;
- entender manualmente RAG antes de utilizar abstrações avançadas;
- manter responsabilidades bem separadas;
- priorizar código simples e legível.

A prioridade não é implementar tudo rapidamente.

A prioridade é entender:

```text
Tool Calling
RAG
Embeddings
Vector Search
Chunking
Retrieval
LLMs
Agents
Context
```

e como essas partes trabalham juntas.

---

# 21. Resultado esperado

Ao final, deverá ser possível conversar naturalmente com a API:

```text
Usuário:
Qual Pokémon é melhor, Bulbasaur ou Squirtle?

Assistant:
[consulta PokéAPI]

Depende do critério...
```

Ou:

```text
Usuário:
Como funciona vantagem de tipo no nosso servidor?

Assistant:
[consulta RAG]

Segundo as regras do servidor...
```

Ou ainda:

```text
Usuário:
Considerando nossas regras, Bulbasaur teria
vantagem contra Squirtle?

Assistant:
[consulta Bulbasaur]
[consulta Squirtle]
[consulta RAG]

Sim. Bulbasaur...
```

O objetivo final é possuir um **agente especializado em Pokémon capaz de escolher autonomamente quais fontes consultar antes de responder**.