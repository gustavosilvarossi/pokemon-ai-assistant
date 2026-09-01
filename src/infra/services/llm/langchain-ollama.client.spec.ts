import { jest } from '@jest/globals';
import { LangChainOllamaClient } from './langchain-ollama.client';
import {
  OllamaProviderError,
  OllamaTimeoutError,
  OllamaUnavailableError,
} from './llm.errors';

describe('LangChainOllamaClient', () => {
  it('invokes the model with the configured timeout', async () => {
    const invoke = jest.fn(() => Promise.resolve({ text: 'answer' }));
    const client = new LangChainOllamaClient({ invoke }, 2500);

    await expect(client.generate('question')).resolves.toBe('answer');
    expect(invoke).toHaveBeenCalledWith('question', { timeout: 2500 });
  });

  it('translates nested abort errors to a timeout error', async () => {
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    const fetchError = new TypeError('fetch failed', { cause: abortError });
    const invoke = jest.fn(() => Promise.reject(fetchError));
    const client = new LangChainOllamaClient({ invoke }, 1000);

    await expect(client.generate('question')).rejects.toBeInstanceOf(
      OllamaTimeoutError,
    );
  });

  it('translates connection failures to an unavailable error', async () => {
    const connectionError = Object.assign(new Error('connection failed'), {
      code: 'ECONNREFUSED',
    });
    const invoke = jest.fn(() => Promise.reject(connectionError));
    const client = new LangChainOllamaClient({ invoke }, 1000);

    await expect(client.generate('question')).rejects.toBeInstanceOf(
      OllamaUnavailableError,
    );
  });

  it('hides unexpected provider details behind a stable error', async () => {
    const invoke = jest.fn(() => Promise.reject(new Error('sensitive detail')));
    const client = new LangChainOllamaClient({ invoke }, 1000);

    await expect(client.generate('question')).rejects.toMatchObject({
      constructor: OllamaProviderError,
      message: 'Ollama request failed',
    });
  });
});
