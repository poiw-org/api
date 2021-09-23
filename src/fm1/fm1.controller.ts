import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import checkPermissions from '../authz/checkPermissions';
import Fm1Service from './fm1.service';

@Controller('fm1')
export class Fm1Controller {

    @Get('/verify/:email')
    async verify(@Param('email') email): Promise<boolean | string> {
        // send verification code to email
        return Fm1Service.sendVerificationCode(email);
    }

    @Post('/verify/:email')
    async verify_code(@Body() body, @Param('email') email): Promise<object | string> {
        // verify code and return token, previous application data
        return Fm1Service.verifyEmail(email, body.code);
    }

    @Post('/apply/:token')
    async apply(@Body() body, @Param('token') token): Promise<boolean | string> {
        // (body has application data) return success or failed
        return Fm1Service.apply(token, body.application);
    }

  @UseGuards(AuthGuard('jwt'))
    @Get('/admin/auth')
    async admin_auth(@Req() request): Promise<boolean | string> {
        const user = await checkPermissions(request, ['fm1_registrations']);
        return !!user;
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/admin/applications')
    async admin_applications(@Req() request): Promise<object[] | string> {
        const user = await checkPermissions(request, ['fm1_registrations']);
        if (!user) return 'Unauthorized';
        return Fm1Service.getApplications();
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('/admin/applications/:id')
    async admin_applications_edit(@Body() body, @Req() request, @Param('id') id): Promise<boolean | string> {
        const user = await checkPermissions(request, ['fm1_registrations']);
        if (!user) return 'Unauthorized';
        body.editedBy = user
        return Fm1Service.editApplication(body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('/admin/applications/:id')
    async admin_applications_delete(@Body() body, @Req() request, @Param('id') id): Promise<boolean | string> {
        const user = await checkPermissions(request, ['fm1_registrations']);
        if (!user) return 'Unauthorized';
        body.editedBy = user
        return Fm1Service.deleteApplication(body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('/admin/applications')
    async admin_applications_delete_all(@Req() request): Promise<boolean | string> {
        const user = await checkPermissions(request, ['fm1_registrations']);
        if (!user) return 'Unauthorized';
        return Fm1Service.deleteApplications();
    }
}
