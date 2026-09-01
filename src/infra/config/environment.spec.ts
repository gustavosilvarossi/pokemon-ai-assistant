import { validateEnvironment } from './environment';

describe('validateEnvironment', () => {
  it('normalizes a valid development environment and applies defaults', () => {
    const environment = validateEnvironment({
      NODE_ENV: 'development',
      DATABASE_URL:
        'postgresql://postgres:postgres@localhost:5432/pokemon_ai_assistant',
    });

    expect(environment).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      OLLAMA_BASE_URL: 'http://127.0.0.1:11434',
      OLLAMA_CHAT_MODEL: 'llama3.2',
      OLLAMA_EMBEDDING_MODEL: 'nomic-embed-text',
      OLLAMA_TEMPERATURE: 0,
      RAG_TOP_K: 5,
    });
  });

  it('uses an isolated placeholder database URL in the test environment', () => {
    const environment = validateEnvironment({ NODE_ENV: 'test' });

    expect(environment.DATABASE_URL).toBe(
      'postgresql://test:test@localhost:5432/pokemon_ai_assistant_test',
    );
  });

  it('accepts OLLAMA_HOST as a backwards-compatible alias', () => {
    const environment = validateEnvironment({
      NODE_ENV: 'test',
      OLLAMA_HOST: 'http://localhost:11435/',
    });

    expect(environment.OLLAMA_BASE_URL).toBe('http://localhost:11435');
  });

  it('reports missing required variables without exposing other values', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'production',
        UNRELATED_SECRET: 'must-not-appear',
      }),
    ).toThrow('DATABASE_URL is required');

    try {
      validateEnvironment({
        NODE_ENV: 'production',
        UNRELATED_SECRET: 'must-not-appear',
      });
    } catch (error) {
      expect((error as Error).message).not.toContain('must-not-appear');
    }
  });

  it.each([
    [{ NODE_ENV: 'test', PORT: 'invalid' }, 'PORT'],
    [{ NODE_ENV: 'test', OLLAMA_BASE_URL: 'file:///tmp' }, 'OLLAMA_BASE_URL'],
    [{ NODE_ENV: 'test', OLLAMA_TEMPERATURE: '2.1' }, 'OLLAMA_TEMPERATURE'],
    [
      { NODE_ENV: 'test', RAG_CHUNK_SIZE: '200', RAG_CHUNK_OVERLAP: '200' },
      'RAG_CHUNK_OVERLAP',
    ],
  ])('rejects invalid configuration %#', (input, expectedKey) => {
    expect(() => validateEnvironment(input)).toThrow(expectedKey);
  });
});
