import * as jwt from "jsonwebtoken";

import {Collection, EntityConstructorOrPath, getRepository} from 'fireorm';

import { nanoid } from 'nanoid';

let getTimestamp = (date: Date): number =>{
    return Math.floor(new Date(date).getTime())
}
@Collection()
export default class Key {
    id: string;
    user: string;
    serialNumber: string;
    expiresAt: Date;
    issuedAt: Date;
    notBefore: Date;
    issuedBy: string;
    disabled: boolean = false;

    async disable(){
        this.disabled = true;
        let repo = Key.getRepo();

        await repo.update(this);
    }

    async enable(){
        this.disabled = false;
        let repo = Key.getRepo();

        await repo.update(this);
    }

    async renew(expiresAt: Date, notBefore: Date){
        this.expiresAt = expiresAt;
        this.notBefore = notBefore;
        this.issuedAt = new Date(Date.now());

        let repo = Key.getRepo();

        await repo.update(this);
    }

    async delete(){
        let repo = Key.getRepo();
        await repo.delete(this.id);
    }

    async getJWT(){
        let repo = Key.getRepo();
        await repo.delete(this.id);
    }

    toJSON(){
        let key = {
            id: this.id,
            user: this.user,
            expiresAt: getTimestamp(this.expiresAt),
            issuedAt: getTimestamp(this.issuedAt),
            notBefore: getTimestamp(this.notBefore),
            issuedBy: this.issuedBy,
            disabled: this.disabled,
            serialNumber: this.serialNumber
        }

        return {
            ...key,
            jwt: jwt.sign({
                id: key.id,
                user: key.user,
                serialNumber: key.serialNumber,
                exp: key.expiresAt,
                nbf: key.notBefore,
                iat: key.issuedAt,
                iss: key.issuedBy,
            }, process.env.JWT_SIGNING_KEY)
        }
    }

    static async create(user: string, serialNumber: string, expiresAt: Date, notBefore: Date, issuedBy: string) {
        let key = new Key();
        key.id = nanoid(16);
        key.user = user;
        key.serialNumber = serialNumber;
        key.expiresAt = expiresAt;
        key.issuedAt = new Date(Date.now());
        key.notBefore = notBefore;
        key.issuedBy = issuedBy;

        let repo = Key.getRepo();

        await repo.create(key);

        return key.toJSON();
    }

    static async findById(id: string): Promise<Key>{
        let repo = Key.getRepo();
        return await repo.findById(id);
    }

    static async getAll(): Promise<Key[]>{
        let repo = Key.getRepo();
        let keys= await repo.find();
        return keys;


    }

    static getRepo = () => getRepository(Key as EntityConstructorOrPath<any>);
}