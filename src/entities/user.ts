import {AccountStatus} from "./accountStatus";
import {DonationCycle} from "./donationCycle";
import { ManagementClient } from "auth0";

const auth0 = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    scope: 'read:users',
  });

export default class User{
    declare email: string;
    declare id;


    constructor(email: string, id: string){
        this.email = email
        this.id = id
    }

    toJSON(){
        return {
            email: this.email,
            id: this.id,
        }
    }

    static fromJSON(json: any){
        return new User(json.email, json.id)
    }

    static async findByEmail(email: string): Promise<User>{
        let users = await auth0.getUsers();
        let user = users.find(user => user.email == email);

        if(user){
            return new User(user.email, user.user_id);
        }

        return null;
    }

    static async findById(id: string): Promise<User>{
        let users = await auth0.getUsers();
        let user = users.find(user => user.user_id == id);

        if(user){
            return new User(user.email, user.user_id);
        }

        return null;
    }

    static async getAll(){
        let users = await auth0.getUsers();
        return users.map(user => new User(user.email, user.user_id))
    }

}