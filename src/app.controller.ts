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
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import Items from './repositories/items.repositories';
import axios from 'axios';
import { UseInterceptors } from '@nestjs/common';
import { SentryInterceptor } from './sentry.interceptor';
@UseInterceptors(SentryInterceptor)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/latest')
  async getLatestItems(): Promise<object> {
    return await Items.getLatestItems();
  }

  @Get('/items/:id')
  async getItem(@Param('id') id): Promise<object> {
    return await Items.getById(id);
  }

  @Post('/search')
  async searchItems(@Body() body): Promise<object[]> {
    return await Items.searchItems(body.query, body.shelf);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/items')
  async createItem(@Body() body, @Req() request): Promise<boolean | string> {
    const { data } = await axios.post(
      `${process.env.AUTH0_ISSUER_URL}userinfo`,
      {},
      {
        headers: {
          Authorization: request.headers.authorization,
        },
      },
    );

    if (!data['https://poiw:eu:auth0:com/roles'].includes('warehouse'))
      return false;

    body.editedBy = body.editedBy || [];
    body.editedBy.push(
      data['https://poiw:eu:auth0:com/app_metadata']?.username || data.email,
    );
    return await Items.createItem(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/items')
  async updateItem(@Body() body, @Req() request): Promise<boolean | string> {
    const { data } = await axios.post(
      `${process.env.AUTH0_ISSUER_URL}userinfo`,
      {},
      {
        headers: {
          Authorization: request.headers.authorization,
        },
      },
    );
    if (!data['https://poiw:eu:auth0:com/roles'].includes('warehouse'))
      return false;

    body.editedBy =
      data['https://poiw:eu:auth0:com/app_metadata']?.username || data.email;
    return await Items.updateItem(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/items')
  async deleteItem(@Body() body, @Req() request): Promise<boolean> {
    const { data } = await axios.post(
      `${process.env.AUTH0_ISSUER_URL}userinfo`,
      {},
      {
        headers: {
          Authorization: request.headers.authorization,
        },
      },
    );
    if (!data['https://poiw:eu:auth0:com/roles'].includes('warehouse'))
      return false;

    return await Items.deleteItem(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/checkOut')
  async checkOut(@Body() body, @Req() request): Promise<boolean> {
    const { data } = await axios.post(
      `${process.env.AUTH0_ISSUER_URL}userinfo`,
      {},
      {
        headers: {
          Authorization: request.headers.authorization,
        },
      },
    );
    if (!data['https://poiw:eu:auth0:com/roles'].includes('warehouse'))
      return false;

    return await Items.checkOut(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/authCheck')
  async authCheck(@Req() request): Promise<boolean> {
    const { data } = await axios.post(
      `${process.env.AUTH0_ISSUER_URL}userinfo`,
      {},
      {
        headers: {
          Authorization: request.headers.authorization,
        },
      },
    );
    if (!data['https://poiw:eu:auth0:com/roles'].includes('warehouse'))
      return false;

    return true;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/barcode')
  async getUnusedBarcode(@Req() request): Promise<string> {
    const { data } = await axios.post(
      `${process.env.AUTH0_ISSUER_URL}userinfo`,
      {},
      {
        headers: {
          Authorization: request.headers.authorization,
        },
      },
    );
    if (!data['https://poiw:eu:auth0:com/roles'].includes('warehouse'))
      return 'Not Allowed';

    return await Items.getUnusedBarcode();
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('/batch')
  async getUnusedBarcodeBatch(@Req() request): Promise<string[] | string> {
    const { data } = await axios.post(
      `${process.env.AUTH0_ISSUER_URL}userinfo`,
      {},
      {
        headers: {
          Authorization: request.headers.authorization,
        },
      },
    );
    if (!data['https://poiw:eu:auth0:com/roles'].includes('warehouse'))
      return 'Not Allowed';

    let i = 0;
    let barcodes: string[] = [];

    while (i != 21) {
      barcodes.push(await Items.getUnusedBarcode());
      i++
    }
    return barcodes;
  }
}
