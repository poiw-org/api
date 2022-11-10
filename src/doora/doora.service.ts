import Key from '../entities/key';
import { NotFoundException } from '@nestjs/common';
import axios from 'axios';

export default {
    async findKeyById(id: string){
        const key = await Key.findById(id);
        if(!key) throw new NotFoundException();
        return key.toJSON()
    },
    async getAll(){
        const keys = await Key.getAll();
        return Array.from(keys).map(key => key.toJSON());
    },
    async disableKey(id: string){
        const key = await Key.findById(id);
        if(!key) throw new NotFoundException();
        await key.disable();
    },
    async enableKey(id: string){
        const key = await Key.findById(id);
        if(!key) throw new NotFoundException();
        await key.enable();
    },
    async createKey(user: string, serialNumber: string, expiresAt: Date, notBefore: Date, issuedBy: string){
        return await Key.create(user, serialNumber, expiresAt, notBefore, issuedBy);
    },
    async renewKey(id: string, expiresAt: Date, notBefore: Date){
        const key = await Key.findById(id);
        if(!key) throw NotFoundException
        await key.renew(expiresAt, notBefore);
    },
    async deleteKey(id: string){
        const key = await Key.findById(id);
        if(!key) throw new NotFoundException();
        await key.delete();
    },
    // async getAllUsers(){
    //     var options = {
    //         method: 'GET',
    //         url: 'https://YOUR_DOMAIN/api/v2/users',

    //       };

    //       axios.get(`${process.env.AUTH0_ISSUER_URL}/api/v2/users`, {
    //         params: {q: 'email:"jane@exampleco.com"', search_engine: 'v3'},
    //         headers: {authorization: 'Bearer {yourMgmtApiAccessToken}'}
    //       })
    // }


}
