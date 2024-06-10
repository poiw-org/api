import { AppController } from './app.controller';
import { AuthzModule } from './authz/authz.module';
import { DooraController } from './doora/doora.controller';
import { Module } from '@nestjs/common';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [AuthzModule],
  controllers: [AppController, DooraController],
  providers: [AuthService],
  // providers: [Fm1Service],
})
export class AppModule {}
