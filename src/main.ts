import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";


dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  Sentry.init({
    dsn: 'https://3dc4e319b9d4418ea396973c12c0d25c@o350531.ingest.sentry.io/5916736',
  });
  app.enableCors();

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
