import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthzModule } from './authz/authz.module';
import { Fm1Controller } from './fm1/fm1.controller';
import { MetaController } from './meta/meta.controller';
// import Fm1Service from './fm1/fm1.service';

@Module({
  imports: [AuthzModule],
  controllers: [AppController, Fm1Controller, MetaController],
  // providers: [Fm1Service],
})
export class AppModule {}
