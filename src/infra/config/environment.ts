export const NODE_ENVIRONMENTS = ['development', 'test', 'production'] as const;

export type NodeEnvironment = (typeof NODE_ENVIRONMENTS)[number];

export interface EnvironmentVariables {
  NODE_ENV: NodeEnvironment;
  PORT: number;
  DATABASE_URL: string;
  OLLAMA_BASE_URL: string;
  OLLAMA_CHAT_MODEL: string;
  OLLAMA_EMBEDDING_MODEL: string;
  OLLAMA_TIMEOUT_MS: number;
  POKEAPI_BASE_URL: string;
  POKEAPI_TIMEOUT_MS: number;
  RAG_TOP_K: number;
  RAG_CHUNK_SIZE: number;
  RAG_CHUNK_OVERLAP: number;
  CHAT_MAX_MESSAGE_LENGTH: number;
  TOOL_MAX_ROUNDS: number;
}

const TEST_DATABASE_URL =
  'postgresql://test:test@localhost:5432/pokemon_ai_assistant_test';

function readOptionalString(
  environment: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = environment[key];

  if (typeof value !== 'string') {
    return undefined;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function readRequiredString(
  environment: Record<string, unknown>,
  key: string,
  errors: string[],
  defaultValue?: string,
): string {
  const value = readOptionalString(environment, key) ?? defaultValue;

  if (value === undefined) {
    errors.push(`${key} is required`);
    return '';
  }

  return value;
}

function readInteger(
  environment: Record<string, unknown>,
  key: string,
  defaultValue: number,
  errors: string[],
  minimum: number,
  maximum: number,
): number {
  const rawValue = environment[key] ?? defaultValue;
  const value =
    typeof rawValue === 'number'
      ? rawValue
      : typeof rawValue === 'string'
        ? Number(rawValue.trim())
        : Number.NaN;

  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    errors.push(`${key} must be an integer between ${minimum} and ${maximum}`);
    return defaultValue;
  }

  return value;
}

function validateUrl(
  key: string,
  value: string,
  protocols: readonly string[],
  errors: string[],
): void {
  try {
    const url = new URL(value);

    if (!protocols.includes(url.protocol)) {
      throw new Error('Unsupported protocol');
    }
  } catch {
    errors.push(`${key} must be a valid ${protocols.join(' or ')} URL`);
  }
}

function readNodeEnvironment(
  environment: Record<string, unknown>,
  errors: string[],
): NodeEnvironment {
  const value = readOptionalString(environment, 'NODE_ENV') ?? 'development';

  if (!NODE_ENVIRONMENTS.includes(value as NodeEnvironment)) {
    errors.push(`NODE_ENV must be one of ${NODE_ENVIRONMENTS.join(', ')}`);
    return 'development';
  }

  return value as NodeEnvironment;
}

export function validateEnvironment(
  environment: Record<string, unknown>,
): EnvironmentVariables & Record<string, unknown> {
  const errors: string[] = [];
  const nodeEnvironment = readNodeEnvironment(environment, errors);
  const databaseUrl = readRequiredString(
    environment,
    'DATABASE_URL',
    errors,
    nodeEnvironment === 'test' ? TEST_DATABASE_URL : undefined,
  );
  const ollamaBaseUrl =
    readOptionalString(environment, 'OLLAMA_BASE_URL') ??
    readOptionalString(environment, 'OLLAMA_HOST') ??
    'http://127.0.0.1:11434';
  const pokeApiBaseUrl = readRequiredString(
    environment,
    'POKEAPI_BASE_URL',
    errors,
    'https://pokeapi.co/api/v2',
  );
  const ragChunkSize = readInteger(
    environment,
    'RAG_CHUNK_SIZE',
    1000,
    errors,
    100,
    10000,
  );
  const ragChunkOverlap = readInteger(
    environment,
    'RAG_CHUNK_OVERLAP',
    200,
    errors,
    0,
    5000,
  );

  if (ragChunkOverlap >= ragChunkSize) {
    errors.push('RAG_CHUNK_OVERLAP must be smaller than RAG_CHUNK_SIZE');
  }

  validateUrl(
    'DATABASE_URL',
    databaseUrl,
    ['postgres:', 'postgresql:'],
    errors,
  );
  validateUrl('OLLAMA_BASE_URL', ollamaBaseUrl, ['http:', 'https:'], errors);
  validateUrl('POKEAPI_BASE_URL', pokeApiBaseUrl, ['http:', 'https:'], errors);

  const validatedEnvironment: EnvironmentVariables = {
    NODE_ENV: nodeEnvironment,
    PORT: readInteger(environment, 'PORT', 3000, errors, 1, 65535),
    DATABASE_URL: databaseUrl,
    OLLAMA_BASE_URL: ollamaBaseUrl.replace(/\/$/, ''),
    OLLAMA_CHAT_MODEL: readRequiredString(
      environment,
      'OLLAMA_CHAT_MODEL',
      errors,
      'llama3.2',
    ),
    OLLAMA_EMBEDDING_MODEL: readRequiredString(
      environment,
      'OLLAMA_EMBEDDING_MODEL',
      errors,
      'nomic-embed-text',
    ),
    OLLAMA_TIMEOUT_MS: readInteger(
      environment,
      'OLLAMA_TIMEOUT_MS',
      60000,
      errors,
      1000,
      300000,
    ),
    POKEAPI_BASE_URL: pokeApiBaseUrl.replace(/\/$/, ''),
    POKEAPI_TIMEOUT_MS: readInteger(
      environment,
      'POKEAPI_TIMEOUT_MS',
      10000,
      errors,
      1000,
      60000,
    ),
    RAG_TOP_K: readInteger(environment, 'RAG_TOP_K', 5, errors, 1, 20),
    RAG_CHUNK_SIZE: ragChunkSize,
    RAG_CHUNK_OVERLAP: ragChunkOverlap,
    CHAT_MAX_MESSAGE_LENGTH: readInteger(
      environment,
      'CHAT_MAX_MESSAGE_LENGTH',
      4000,
      errors,
      1,
      50000,
    ),
    TOOL_MAX_ROUNDS: readInteger(
      environment,
      'TOOL_MAX_ROUNDS',
      5,
      errors,
      1,
      20,
    ),
  };

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.join('; ')}`);
  }

  return {
    ...environment,
    ...validatedEnvironment,
  };
}
