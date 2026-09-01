import { Inject, Injectable } from '@nestjs/common';
import { LLM_CHAT_CLIENT } from './llm.client';
import type { LlmChatClient } from './llm.client';
import { LlmInputError, LlmInvalidResponseError } from './llm.errors';

export interface LlmAnswer {
  answer: string;
}

@Injectable()
export class LlmService {
  constructor(
    @Inject(LLM_CHAT_CLIENT)
    private readonly chatClient: LlmChatClient,
  ) {}

  async generateAnswer(message: string): Promise<LlmAnswer> {
    const normalizedMessage = message.trim();

    if (normalizedMessage.length === 0) {
      throw new LlmInputError('Message must not be empty');
    }

    const answer = (await this.chatClient.generate(normalizedMessage)).trim();

    if (answer.length === 0) {
      throw new LlmInvalidResponseError('Ollama returned an empty response');
    }

    return { answer };
  }
}
