import { SetMetadata } from '@nestjs/common';

export const RequiredPermissions = (...args: string[]) => SetMetadata('required-permissions', args);
