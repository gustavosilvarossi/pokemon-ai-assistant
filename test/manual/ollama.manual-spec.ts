import { ConfigModule } from '@nestjs/config';
import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { validateEnvironment } from '../../src/infra/config/environment';
import { LlmModule } from '../../src/infra/services/llm/llm.module';
import { LlmService } from '../../src/infra/services/llm/llm.service';

describe('Ollama (manual)', () => {
  jest.setTimeout(120000);

  it('returns a non-empty answer from the configured local model', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validate: (environment) =>
            validateEnvironment({ ...environment, NODE_ENV: 'test' }),
        }),
        LlmModule,
      ],
    }).compile();

    const service = moduleRef.get(LlmService);
    const response = await service.generateAnswer('Reply with only: OK');

    expect(response.answer.length).toBeGreaterThan(0);
    await moduleRef.close();
  });
});
