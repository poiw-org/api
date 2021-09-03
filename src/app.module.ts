import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthzModule } from './authz/authz.module';

@Module({
  imports: [AuthzModule],
  controllers: [AppController],
})
export class AppModule {}
