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
import { AuthGuard } from '@nestjs/passport';
import Service from './app.service';
import { UseInterceptors } from '@nestjs/common';
import { SentryInterceptor } from './sentry.interceptor';
import checkPermissions from './authz/checkPermissions';
@UseInterceptors(SentryInterceptor)
@Controller('warehouse')
export class AppController {

  @Get('/latest')
  async getLatestItems(): Promise<object> {
    return await Service.getLatestItems();
  }

  @Get('/items/:id')
  async getItem(@Param('id') id): Promise<object> {
    return await Service.getById(id);
  }

  @Post('/search')
  async searchItems(@Body() body): Promise<object[]> {
    return await Service.searchItems(body.query, body.shelf);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/items')
  async createItem(@Body() body, @Req() request): Promise<boolean | string> {
    const user = await checkPermissions(request, ['warehouse']);
    if (!user) return 'Unauthorized';
    body.editedBy = user;
    return await Service.createItem(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/items')
  async updateItem(@Body() body, @Req() request): Promise<boolean | string> {
    const user = await checkPermissions(request, ['warehouse']);
    if (!user) return 'Unauthorized';
    body.editedBy = user
    return await Service.updateItem(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/items')
  async deleteItem(@Body() body, @Req() request): Promise<boolean> {
    const user = await checkPermissions(request, ['warehouse']);
    if (!user) return false;

    return await Service.deleteItem(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/checkOut')
  async checkOut(@Body() body, @Req() request): Promise<boolean | string> {
    const user = await checkPermissions(request, ['warehouse']);
    if (!user) return 'Unauthorized';
    body.editedBy = user;

    return await Service.checkOut(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/authCheck')
  async authCheck(@Req() request): Promise<boolean> {
    const user = await checkPermissions(request, ['warehouse']);
    if (!user) return false;
    return true;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/barcode')
  async getUnusedBarcode(@Req() request): Promise<string> {
    const user = await checkPermissions(request, ['warehouse']);
    if (!user) return 'Unauthorized';

    return await Service.getUnusedBarcode();
  }
  @UseGuards(AuthGuard('jwt'))
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
