<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Pokémon AI Assistant API built with NestJS 12, TypeScript, Prisma, Ollama and RAG.

## Project setup

### Requirements

- Node.js 24.20.0 (use `nvm use` with the version declared in `.nvmrc`)
- npm 11+
- Prisma ORM 7.10.0 (CLI and Client are pinned to the same exact version)

```bash
$ npm install
```

Copy `.env.example` to `.env` and replace only the values required by your environment. Development and production require `DATABASE_URL`; tests use an isolated placeholder and do not connect unless an integration explicitly needs the database.

The application validates these settings during startup:

| Variable                  | Default                     | Required                   |
| ------------------------- | --------------------------- | -------------------------- |
| `NODE_ENV`                | `development`               | No                         |
| `PORT`                    | `3000`                      | No                         |
| `DATABASE_URL`            | —                           | Development and production |
| `OLLAMA_BASE_URL`         | `http://127.0.0.1:11434`    | No                         |
| `OLLAMA_CHAT_MODEL`       | `llama3.2`                  | No                         |
| `OLLAMA_EMBEDDING_MODEL`  | `nomic-embed-text`          | No                         |
| `OLLAMA_TEMPERATURE`      | `0`                         | No                         |
| `OLLAMA_TIMEOUT_MS`       | `60000`                     | No                         |
| `POKEAPI_BASE_URL`        | `https://pokeapi.co/api/v2` | No                         |
| `POKEAPI_TIMEOUT_MS`      | `10000`                     | No                         |
| `RAG_TOP_K`               | `5`                         | No                         |
| `RAG_CHUNK_SIZE`          | `1000`                      | No                         |
| `RAG_CHUNK_OVERLAP`       | `200`                       | No                         |
| `CHAT_MAX_MESSAGE_LENGTH` | `4000`                      | No                         |
| `TOOL_MAX_ROUNDS`         | `5`                         | No                         |

`OLLAMA_HOST` remains accepted as a compatibility alias for `OLLAMA_BASE_URL`.

The infrastructure module `LlmModule` exports `LlmService`, which communicates with Ollama through LangChain without depending on HTTP, Prisma or PokéAPI. Automated tests replace the model client with a local fake. Use `npm run test:ollama` only when you intentionally want to call the configured Ollama instance.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## HTTP routes

Each public API controller declares its complete `/resources/v1/<resource>` route. The current temporary health endpoint is:

```text
GET /resources/v1/health
```

The former starter endpoint `GET /` has been removed and returns `404`.

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# integration tests
$ npm run test:integration

# optional manual test against the configured local Ollama
$ npm run test:ollama

# test coverage
$ npm run test:cov
```

## Quality checks

Run the same validation pipeline used by CI:

```bash
$ npm run check
```

The command validates and generates Prisma Client, checks formatting and lint without modifying files, runs unit, integration and e2e tests, builds the application and audits dependencies. Use `npm run format` or `npm run lint:fix` when you intentionally want automatic fixes.

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
