import { ConfigModule } from '@nestjs/config';
import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { validateEnvironment } from '../../src/infra/config/environment';
import {
  LLM_CHAT_CLIENT,
  LlmChatClient,
} from '../../src/infra/services/llm/llm.client';
import { LlmModule } from '../../src/infra/services/llm/llm.module';
import { LlmService } from '../../src/infra/services/llm/llm.service';

describe('LlmModule (integration)', () => {
  it('exports a service that collaborates with an injected local fake', async () => {
    const fakeClient: LlmChatClient = {
      generate: jest.fn((message: string) =>
        Promise.resolve(`fake response for: ${message}`),
      ),
    };
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          isGlobal: true,
          validate: () => validateEnvironment({ NODE_ENV: 'test' }),
        }),
        LlmModule,
      ],
    })
      .overrideProvider(LLM_CHAT_CLIENT)
      .useValue(fakeClient)
      .compile();

    const service = moduleRef.get(LlmService);

    await expect(service.generateAnswer('Pikachu')).resolves.toEqual({
      answer: 'fake response for: Pikachu',
    });

    await moduleRef.close();
  });
});
