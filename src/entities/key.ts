import * as jwt from "jsonwebtoken";
import {Collection, EntityConstructorOrPath, getRepository} from 'fireorm';
import { nanoid } from 'nanoid';

let getTimestamp = (date: Date): number =>{
    return Math.floor(new Date(date).getTime() / 1000) // In the Arduino, the timestamp is stored in a 32bit unsigned long. So there is not enough space.
}
@Collection()
export default class Key {
    id: string;
    user: {
        id: string;
        email: string;
    };
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
            expiresAt: this.expiresAt,
            issuedAt: this.issuedAt,
            notBefore: this.notBefore,
            issuedBy: this.issuedBy,
            disabled: this.disabled,
            serialNumber: this.serialNumber
        }

        return {
            ...key,
            jwt: jwt.sign({
                jti: this.id,
                sub: this.user.id,
                aud: this.serialNumber,
                exp: getTimestamp(this.expiresAt),
                nbf: getTimestamp(this.notBefore),
                iat: getTimestamp(this.issuedAt),
                iss: this.issuedBy,
            }, process.env.JWT_SIGNING_KEY)
        }
    }

    static async create(user: any, serialNumber: string, expiresAt: Date, notBefore: Date, issuedBy: string) {
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

    static async findBySerialNumber(serialNumber: string): Promise<Key>{
        let repo = Key.getRepo();
        return await repo.whereEqualTo("serialNumber", serialNumber).findOne();
    }

    static async getAll(): Promise<Key[]>{
        let repo = Key.getRepo();
        let keys= await repo.find();
        return keys;


    }

    static getRepo = () => getRepository(Key as EntityConstructorOrPath<any>);
}