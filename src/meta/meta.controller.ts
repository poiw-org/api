import {Controller, Get, Req, UseGuards} from '@nestjs/common';
import {AuthGuard} from "@nestjs/passport";
import checkPermissions from "../authz/checkPermissions";
import client from "../providers/mongo.providers";
import User from "../entities/user";
import {DonationCycle} from "../entities/donationCycle";
import {AccountStatus} from "../entities/accountStatus";
// import DiscordOauth2 from "discord-oauth2";

@Controller('meta')
export class MetaController {
    @UseGuards(AuthGuard('jwt'))
    @Get('/user')
    async getUser(@Req() request): Promise<object> {
        const userFromProvider = await checkPermissions(request, [], true);

        await client.connect();

        let userFromDB = await client
            .db('meta')
            .collection('users')
            .findOne({ email: userFromProvider.email });

        let user: User;

        if(!userFromDB){
            user = new User(undefined,userFromProvider.email, AccountStatus.PENDING_INFO, DonationCycle.NONE, 0, false, undefined, false)
            await client
                .db('meta')
                .collection('users')
                .insertOne(user.toJSON());
        }else{
            user = User.fromJSON(userFromDB)
        }



        return user.toJSON();
    }


}
