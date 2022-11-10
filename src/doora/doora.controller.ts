import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import checkPermissions from '../authz/checkPermissions';
import DooraService  from './doora.service';

@Controller('doora')
export class DooraController {

    @UseGuards(AuthGuard('jwt'))
    @Get('/key')
    async findKey(@Req() request, @Query("id") id): Promise<object[] | string> {
        const user = await checkPermissions(request, ['warehouse']);
        if (!user) return 'Unauthorized';
        return await DooraService.findKeyById(id) as any;
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/key')
    async createKey(@Req() request, @Body() body): Promise<object[] | string> {
        const _user = await checkPermissions(request, ['warehouse']);
        if (!_user) return 'Unauthorized';

        let {user, serialNumber, expiresAt, notBefore} = body;
        return await DooraService.createKey(user, serialNumber, expiresAt, notBefore, _user) as any;
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('/key/renew')
    async renewKey(@Req() request, @Body() body): Promise<object[] | string> {
        const _user = await checkPermissions(request, ['warehouse']);
        if (!_user) return 'Unauthorized';

        let {id, expiresAt, notBefore} = body;

        return await DooraService.renewKey(id, expiresAt, notBefore) as any;
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('/key/disable')
    async disableKey(@Req() request, @Body() body): Promise<object[] | string> {
        const _user = await checkPermissions(request, ['warehouse']);
        if (!_user) return 'Unauthorized';

        let {id} = body;

        return await DooraService.disableKey(id) as any;
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('/key/enable')
    async enableKey(@Req() request, @Body() body): Promise<object[] | string> {
        const _user = await checkPermissions(request, ['warehouse']);
        if (!_user) return 'Unauthorized';

        let {id} = body;

        return await DooraService.enableKey(id) as any;
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('/key')
    async deleteKey(@Req() request, @Query("id") id): Promise<object[] | string> {
        const _user = await checkPermissions(request, ['warehouse']);
        if (!_user) return 'Unauthorized';

        return await DooraService.deleteKey(id) as any;
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/keys')
    async getAll(@Req() request): Promise<object[] | string> {
        const user = await checkPermissions(request, ['warehouse']);

        if (!user) return 'Unauthorized';
        return await DooraService.getAll() as any;
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/authCheck')
    async authCheck(@Req() request): Promise<boolean> {
        const user = await checkPermissions(request, ['warehouse']);
        return !!user;
    }


    // @UseGuards(AuthGuard('jwt'))
    // @Get('/key/:id')
    // async findKey(@Req() request, @Param("id") id): Promise<object[] | string> {
    //     const user = await checkPermissions(request, ['doora']);
    //     if (!user) return 'Unauthorized';
    //     return await DooraService.findKeyById(id) as any;
    // }
}
