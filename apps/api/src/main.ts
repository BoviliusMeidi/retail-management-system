import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { appConfig } from './core/config/app.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(appConfig.port);
}
await bootstrap();
