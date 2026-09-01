import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOllama } from '@langchain/ollama';
import { EnvironmentVariables } from '../../config/environment';
import { LangChainOllamaClient } from './langchain-ollama.client';
import { LLM_CHAT_CLIENT } from './llm.client';
import { LlmService } from './llm.service';

@Module({
  providers: [
    LlmService,
    {
      provide: LLM_CHAT_CLIENT,
      inject: [ConfigService],
      useFactory: (
        config: ConfigService<EnvironmentVariables, true>,
      ): LangChainOllamaClient => {
        const model = new ChatOllama({
          baseUrl: config.get('OLLAMA_BASE_URL', { infer: true }),
          model: config.get('OLLAMA_CHAT_MODEL', { infer: true }),
          temperature: config.get('OLLAMA_TEMPERATURE', { infer: true }),
          maxRetries: 0,
        });

        return new LangChainOllamaClient(
          model,
          config.get('OLLAMA_TIMEOUT_MS', { infer: true }),
        );
      },
    },
  ],
  exports: [LlmService],
})
export class LlmModule {}
