import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import Service from './app.service';
import { UseInterceptors } from '@nestjs/common';
import { SentryInterceptor } from './sentry.interceptor';
import checkPermissions from './authz/checkPermissions';
import { AuthInterceptor } from './interceptors/auth/auth.interceptor';
import { RequiredPermissions } from './auth/required-permissions/required-permissions.decorator';
import { IsPublic } from './auth/is-public/is-public.decorator';

@UseInterceptors(SentryInterceptor, AuthInterceptor)
@Controller('warehouse')
export class AppController {
    @IsPublic()
    @Get('/latest')
    async getLatestItems(): Promise<object> {
        return await Service.getLatestItems();
    }

    @IsPublic()
    @Get('/items/:id')
    async getItem(@Param('id') id): Promise<object> {
        return await Service.getById(id);
    }

    @IsPublic()
    @Post('/search')
    async searchItems(@Body() body): Promise<object[]> {
        return await Service.searchItems(body.query, body.shelf);
    }

    @RequiredPermissions('warehouse:admin')
    @Post('/items')
    async createItem(@Body() body, @Req() request): Promise<boolean | string> {
        const user = await checkPermissions(request, ['warehouse']);
        if (!user) return 'Unauthorized';
        body.editedBy = user;
        return await Service.createItem(body);
    }

    @RequiredPermissions('warehouse:admin')
    @Patch('/items')
    async updateItem(@Body() body, @Req() request): Promise<boolean | string> {
        const user = await checkPermissions(request, ['warehouse']);
        if (!user) return 'Unauthorized';
        body.editedBy = user
        return await Service.updateItem(body);
    }

    @RequiredPermissions('warehouse:admin')
    @Delete('/items')
    async deleteItem(@Body() body, @Req() request): Promise<boolean> {
        const user = await checkPermissions(request, ['warehouse']);
        if (!user) return false;

        return await Service.deleteItem(body);
    }

    @RequiredPermissions('warehouse:admin')
    @Delete('/checkOut')
    async checkOut(@Body() body, @Req() request): Promise<boolean | string> {
        const user = await checkPermissions(request, ['warehouse']);
        if (!user) return 'Unauthorized';
        body.editedBy = user;

        return await Service.checkOut(body);
    }

    @RequiredPermissions('warehouse:admin')
    @Post('/authCheck')
    async authCheck(@Req() request): Promise<boolean> {
        const user = await checkPermissions(request, ['warehouse']);
        return !!user;
    }

    @RequiredPermissions('warehouse:admin')
    @Get('/barcode')
    async getUnusedBarcode(@Req() request): Promise<string> {
        const user = await checkPermissions(request, ['warehouse']);
        if (!user) return 'Unauthorized';

        return await Service.getUnusedBarcode();
    }
    @RequiredPermissions('warehouse:admin')
    @Get('/batch')
    async getUnusedBarcodeBatch(@Req() request): Promise<string[] | string> {
        const user = await checkPermissions(request, ['warehouse']);
        if (!user) return 'Unauthorized';

        let i = 0;
        let barcodes: string[] = [];

        while (i != 21) {
            barcodes.push(await Service.getUnusedBarcode());
            i++
        }

        return barcodes;
    }
}
