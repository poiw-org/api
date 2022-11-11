import { ConflictException, NotFoundException } from '@nestjs/common';
import { Entry, EntryType } from '../entities/entry';

import Key from '../entities/key';
import User from '../entities/user';
import {getDatabase} from "firebase-admin/database"

export default {
    async findKeyById(id: string){
        const key = await Key.findById(id);
        if(!key) throw new NotFoundException();
        return key.toJSON()
    },
    async findKeyBySerialNumber(serialNumber: string){
        const key = await Key.findBySerialNumber(serialNumber);
        if(!key) throw new NotFoundException();
        return key.toJSON()
    },
    async getAll(){
        const keys = await Key.getAll();
        return Array.from(keys).map(key => key.toJSON());
    },
    async disableKey(id: string){
        var db = getDatabase();

        const key = await Key.findById(id);
        if(!key) throw new NotFoundException();
        await key.disable();

        await db
        .ref(`admin/blacklistedKeys/${key.id}`)
        .set(true);
    },
    async enableKey(id: string){
        var db = getDatabase();

        const key = await Key.findById(id);
        if(!key) throw new NotFoundException();
        await key.enable();

        await db
        .ref(`admin/blacklistedKeys/${key.id}`)
        .remove();
    },
    async createKey(user: any, serialNumber: string, expiresAt: Date, notBefore: Date, issuedBy: string){
        let tagAlreadyTaken = await Key.findBySerialNumber(serialNumber);

        if(tagAlreadyTaken){
            console.log(tagAlreadyTaken);

            throw new ConflictException();
        }

        console.log(user);


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

        var db = getDatabase();

        await db
            .ref("entries/front")
            .orderByChild("id")
            .equalTo(key.id)
            .get()
        await db
            .ref("failedAuthorizations/front")
            .orderByChild("id")
            .equalTo(key.id)
            .get()
    },
    async forceOpen(){
        var db = getDatabase();

        db.ref("admin/forceOpen/front").set(true);
    },
    async getEntriesByKey(id: string){
        const key = await Key.findById(id);
        if(!key) throw new NotFoundException();

        var db = getDatabase();

        const successfulEntries =
        (
            await db
                .ref("entries/front")
                .orderByChild("id")
                .equalTo(key.id)
                .get()

        ).toJSON()

        const failedEntries =
        (
            await db
                .ref("failedAuthorizations/front")
                .orderByChild("id")
                .equalTo(key.id)
                .get()

        ).toJSON()

        let entries: Entry[] = [];

        for(let entry in successfulEntries as any){
            entries.push(Entry.fromJSON(successfulEntries[entry], EntryType.SUCCESSFUL));
        }

        for(let entry in failedEntries as any){
            entries.push(Entry.fromJSON(failedEntries[entry], EntryType.FAILED));
        }

        entries = entries.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return b.timestamp.getTime() - a.timestamp.getTime();
          });

        return entries;

    },

    async getAllUsers(){
        return await User.getAll();
    }
}
