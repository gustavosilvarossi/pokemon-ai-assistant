import { jest } from '@jest/globals';
import { LlmChatClient } from './llm.client';
import { LlmInputError, LlmInvalidResponseError } from './llm.errors';
import { LlmService } from './llm.service';

describe('LlmService', () => {
  let client: jest.Mocked<LlmChatClient>;
  let service: LlmService;

  beforeEach(() => {
    client = {
      generate: jest.fn(),
    };
    service = new LlmService(client);
  });

  it('normalizes the message and returns the generated answer', async () => {
    client.generate.mockResolvedValue('  Hello from Ollama.  ');

    await expect(service.generateAnswer('  Hello  ')).resolves.toEqual({
      answer: 'Hello from Ollama.',
    });
    expect(client.generate.mock.calls).toEqual([['Hello']]);
  });

  it('rejects an empty message before invoking the client', async () => {
    await expect(service.generateAnswer('   ')).rejects.toBeInstanceOf(
      LlmInputError,
    );
    expect(client.generate.mock.calls).toHaveLength(0);
  });

  it('rejects an empty model response', async () => {
    client.generate.mockResolvedValue('   ');

    await expect(service.generateAnswer('Hello')).rejects.toBeInstanceOf(
      LlmInvalidResponseError,
    );
  });
});
