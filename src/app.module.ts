import { AppController } from './app.controller';
import { AuthzModule } from './authz/authz.module';
import { DooraController } from './doora/doora.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [AuthzModule],
  controllers: [AppController, DooraController],
  providers: [],
  // providers: [Fm1Service],
})
export class AppModule {}
