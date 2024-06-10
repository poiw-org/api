import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UnauthorizedException,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import checkPermissions from '../authz/checkPermissions';
import DooraService  from './doora.service';
import { AuthInterceptor } from '../interceptors/auth/auth.interceptor';
import { RequiredPermissions } from '../auth/required-permissions/required-permissions.decorator';

@UseInterceptors(AuthInterceptor)
@Controller('doora')
export class DooraController {

    @RequiredPermissions('doora:admin')
    @Get('/key')
    async findKey(@Req() request, @Query("id") id, @Query("serialNumber") serialNumber): Promise<object[] | string> {
        const user = await checkPermissions(request, ['warehouse']);
        if (!user) throw new UnauthorizedException();

        if(id) return await DooraService.findKeyById(id) as any;
        else if(serialNumber) return await DooraService.findKeyBySerialNumber(serialNumber) as any;
        else throw new BadRequestException();
    }

    @RequiredPermissions('doora:admin')
    @Post('/key')
    async createKey(@Req() request, @Body() body): Promise<object[] | string> {
        const _user = await checkPermissions(request, ['warehouse']);
        if (!_user) throw new UnauthorizedException();

        let {user, serialNumber, expiresAt, notBefore} = body;

        if(!user || !serialNumber || !expiresAt || !notBefore) throw new BadRequestException();

        return await DooraService.createKey(user, serialNumber, expiresAt, notBefore, _user) as any;
    }

    @RequiredPermissions('doora:admin')
    @Patch('/key/renew')
    async renewKey(@Req() request, @Body() body): Promise<object[] | string> {
        const _user = await checkPermissions(request, ['warehouse']);
        if (!_user) throw new UnauthorizedException();

        let {id, expiresAt, notBefore} = body;
        if(!id || !expiresAt || !notBefore) throw new BadRequestException();

        return await DooraService.renewKey(id, expiresAt, notBefore) as any;
    }

    @RequiredPermissions('doora:admin')
    @Patch('/key/disable')
    async disableKey(@Req() request, @Body() body): Promise<object[] | string> {
        const _user = await checkPermissions(request, ['warehouse']);
        if (!_user) throw new UnauthorizedException();

        let {id} = body;
        if(!id) throw new BadRequestException();

        return await DooraService.disableKey(id) as any;
    }

    @RequiredPermissions('doora:admin')
    @Patch('/key/enable')
    async enableKey(@Req() request, @Body() body): Promise<object[] | string> {
        const _user = await checkPermissions(request, ['warehouse']);
        if (!_user) throw new UnauthorizedException();

        let {id} = body;
        if(!id) throw new BadRequestException();

        return await DooraService.enableKey(id) as any;
    }

    @RequiredPermissions('doora:admin')
    @Delete('/key')
    async deleteKey(@Req() request, @Query("id") id): Promise<object[] | string> {
        const _user = await checkPermissions(request, ['warehouse']);
        if (!_user) throw new UnauthorizedException();

        if(!id) throw new BadRequestException();

        return await DooraService.deleteKey(id) as any;
    }

    @RequiredPermissions('doora:admin')
    @Get('/keys')
    async getAll(@Req() request): Promise<object[] | string> {
        const user = await checkPermissions(request, ['warehouse']);

        if (!user) throw new UnauthorizedException();
        return await DooraService.getAll() as any;
    }

    @RequiredPermissions('doora:admin')
    @Post('/authCheck')
    async authCheck(@Req() request): Promise<boolean> {
        const user = await checkPermissions(request, ['warehouse']);
        return !!user;
    }


    @RequiredPermissions('doora:admin')
    @Get('/forceOpen')
    async forceOpen(@Req() request): Promise<void> {
        const user = await checkPermissions(request, ['warehouse']);
        if (!user) throw new UnauthorizedException();

        return await DooraService.forceOpen() as any;
    }

    @RequiredPermissions('doora:admin')
    @Get('/entries')
    async getEntriesByKey(@Req() request, @Query("id") id): Promise<void> {
        const user = await checkPermissions(request, ['warehouse']);
        if (!user) throw new UnauthorizedException();

        return await DooraService.getEntriesByKey(id) as any;
    }

    @RequiredPermissions('doora:admin')
    @Get('/users')
    async getUsers(@Req() request): Promise<object[] | string> {
        const user = await checkPermissions(request, ['warehouse']);
        if (!user) throw new UnauthorizedException();

        return await DooraService.getAllUsers() as any;
    }
}
