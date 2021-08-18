import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Put,
  Delete,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import Items from './repositories/items.repositories';
import axios from 'axios';
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
    return await Items.searchItems(body.query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/items')
  async createItem(@Body() body, @Req() request): Promise<boolean> {
    const { data } = await axios.post(
      `${process.env.AUTH0_ISSUER_URL}userinfo`,
      {},
      {
        headers: {
          Authorization: request.headers.authorization,
        },
      },
    );

    body.editedBy = body.editedBy || [];
    body.editedBy.push(
      data['https://poiw:eu:auth0:com/app_metadata']?.username || data.email,
    );
    return await Items.createItem(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/items')
  async updateItem(@Body() body, @Req() request): Promise<boolean> {
    const { data } = await axios.post(
      `${process.env.AUTH0_ISSUER_URL}userinfo`,
      {},
      {
        headers: {
          Authorization: request.headers.authorization,
        },
      },
    );
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

    return await Items.checkOut(body);
  }
}
