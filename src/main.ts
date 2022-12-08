import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import * as admin from 'firebase-admin';
import * as bodyParser from 'body-parser';
import * as dotenv from "dotenv";
import * as fireorm from 'fireorm';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

const serviceAccount = true ? JSON.parse(Buffer.from(process.env.FIREBASE, 'base64').toString("ascii")) : require('../firestore.creds.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const firestore = admin.firestore();
fireorm.initialize(firestore);

dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  Sentry.init({
    dsn: 'https://3dc4e319b9d4418ea396973c12c0d25c@o350531.ingest.sentry.io/5916736',
  });
  app.enableCors();

  const config = new DocumentBuilder()
  .setTitle('po/iw API')
  .setDescription('po/iw hackerspace API')
  .setVersion('1.0')
  .build();

const document = SwaggerModule.createDocument(app, config);

SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
