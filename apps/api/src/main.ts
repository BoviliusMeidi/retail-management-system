import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { appConfig } from './core/config/app.config.js';
import { AppLoggerService } from './core/logger/app-logger.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  await app.listen(appConfig.port);
  logger.log(
    `API running on port ${appConfig.port} (${appConfig.env}) mode`,
    'Bootstrap',
  )
}

void bootstrap();