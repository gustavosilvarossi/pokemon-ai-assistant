export class LlmInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = LlmInputError.name;
  }
}

export class LlmInvalidResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = LlmInvalidResponseError.name;
  }
}

export class OllamaTimeoutError extends Error {
  constructor(options?: ErrorOptions) {
    super('Ollama request timed out', options);
    this.name = OllamaTimeoutError.name;
  }
}

export class OllamaUnavailableError extends Error {
  constructor(options?: ErrorOptions) {
    super('Ollama service is unavailable', options);
    this.name = OllamaUnavailableError.name;
  }
}

export class OllamaProviderError extends Error {
  constructor(options?: ErrorOptions) {
    super('Ollama request failed', options);
    this.name = OllamaProviderError.name;
  }
}
