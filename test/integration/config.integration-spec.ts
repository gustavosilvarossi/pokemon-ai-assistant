import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import {
  EnvironmentVariables,
  validateEnvironment,
} from '../../src/infra/config/environment';

describe('ConfigModule (integration)', () => {
  it('exposes normalized and typed configuration through Nest', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          cache: false,
          ignoreEnvFile: true,
          isGlobal: true,
          validate: () =>
            validateEnvironment({
              NODE_ENV: 'test',
              PORT: '3100',
              OLLAMA_BASE_URL: 'http://localhost:11434/',
            }),
        }),
      ],
    }).compile();

    const config =
      moduleRef.get<ConfigService<EnvironmentVariables, true>>(ConfigService);

    expect(config.get('PORT', { infer: true })).toBe(3100);
    expect(config.get('OLLAMA_BASE_URL', { infer: true })).toBe(
      'http://localhost:11434',
    );
    expect(config.get('OLLAMA_CHAT_MODEL', { infer: true })).toBe('llama3.2');

    await moduleRef.close();
  });
});
