export const LLM_CHAT_CLIENT = Symbol('LLM_CHAT_CLIENT');

export interface LlmChatClient {
  generate(message: string): Promise<string>;
}
