import { LlmChatClient } from './llm.client';
import {
  OllamaProviderError,
  OllamaTimeoutError,
  OllamaUnavailableError,
} from './llm.errors';

interface ChatModelInvoker {
  invoke(
    message: string,
    options: { timeout: number },
  ): Promise<{ readonly text: string }>;
}

const TIMEOUT_ERROR_NAMES = new Set(['AbortError', 'TimeoutError']);
const TIMEOUT_ERROR_CODES = new Set(['ETIMEDOUT', 'UND_ERR_CONNECT_TIMEOUT']);
const UNAVAILABLE_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'EHOSTUNREACH',
]);

function errorChainHas(
  error: unknown,
  property: 'code' | 'name',
  expectedValues: ReadonlySet<string>,
): boolean {
  let currentError = error;

  for (let depth = 0; depth < 4; depth += 1) {
    if (typeof currentError !== 'object' || currentError === null) {
      return false;
    }

    const value: unknown = Reflect.get(currentError, property);

    if (typeof value === 'string' && expectedValues.has(value)) {
      return true;
    }

    currentError = Reflect.get(currentError, 'cause');
  }

  return false;
}

function translateOllamaError(error: unknown): Error {
  if (
    errorChainHas(error, 'name', TIMEOUT_ERROR_NAMES) ||
    errorChainHas(error, 'code', TIMEOUT_ERROR_CODES)
  ) {
    return new OllamaTimeoutError({ cause: error });
  }

  if (errorChainHas(error, 'code', UNAVAILABLE_ERROR_CODES)) {
    return new OllamaUnavailableError({ cause: error });
  }

  return new OllamaProviderError({ cause: error });
}

export class LangChainOllamaClient implements LlmChatClient {
  constructor(
    private readonly model: ChatModelInvoker,
    private readonly timeoutMs: number,
  ) {}

  async generate(message: string): Promise<string> {
    try {
      const response = await this.model.invoke(message, {
        timeout: this.timeoutMs,
      });

      return response.text;
    } catch (error) {
      throw translateOllamaError(error);
    }
  }
}
