import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import checkPermissions from '../authz/checkPermissions';
import Fm1Service from './fm1.service';

@Controller('fm1')
export class Fm1Controller {

    @Post('/sendVerificationCode')
    async sendVerificationCode(@Body() body): Promise<boolean | string> {
        // send verification code to email
        return Fm1Service.sendVerificationCode(body.email);
    }

    @Post('/verify')
    async verify_code(@Body() body): Promise<object | string> {
        // verify code and return token
        return Fm1Service.verifyEmail(body.email, body.verificationCode);
    }

    @Post('/logout')
    async logout(@Body() body): Promise<boolean>{
        return Fm1Service.deleteAuth(body.email, body.token);
    }

    @Post('/previousApplication')
    async previousApplication(@Body() body, ): Promise<object | string>{
        return Fm1Service.getPreviousApplication(body.email, body.token);
    }


    @Post('/apply')
    async apply(@Body() body): Promise<boolean | string> {
        // (body has application data) return success or failed
        return Fm1Service.apply(body.token, body.application);
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
        // body.editedBy = user
        return Fm1Service.editApplication(body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('/admin/applications/:id')
    async admin_applications_delete(@Body() body, @Req() request, @Param('id') id): Promise<boolean | string> {
        const user = await checkPermissions(request, ['fm1_registrations']);
        if (!user) return 'Unauthorized';
        // body.editedBy = user
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
