import { CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auth: AuthService,
  ) {
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const isPublic = this.reflector.get<boolean>('is-public', context.getHandler());
    if (isPublic) return next.handle();

    const request = context.switchToHttp().getRequest();
    const headers = request.headers;
    const token = headers['authorization'].split(' ')[1];

    try {
      request.user = await this.auth.validateToken(token);
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException('Invalid token');
    }

    const requiredPermissions = this.reflector.get<string[]>('required-permissions', context.getHandler());
    if (!requiredPermissions) return next.handle();


    if (!requiredPermissions.some(role => request.user.permissions?.some((perm: string) => perm === role)))
      throw new UnauthorizedException('Insufficient permissions');

    return next.handle();

  }
}
