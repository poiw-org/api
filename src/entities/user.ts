import {DonationCycle} from "./donationCycle";
import {AccountStatus} from "./accountStatus";

export default class User{
    //Basic data
    declare fullName: string|undefined;
    declare email: string;
    declare status: AccountStatus;

    // Donations
    declare donationCycle: DonationCycle
    declare balance: number;
    declare exemptFromDonations: boolean;

    //Discord
    declare discordID: string|undefined;
    declare exemptFromDiscord: boolean;

    constructor(fullName: string|undefined, email: string, status: AccountStatus, donationCycle: DonationCycle, balance: number, exemptFromDonations: boolean, discordID: string|undefined, exemptFromDiscord: boolean) {
        this.fullName = fullName;
        this.email = email;
        this.status = status;

        this.donationCycle = donationCycle;
        this.balance = balance;
        this.exemptFromDonations = exemptFromDonations;

        this.discordID = discordID;
        this.exemptFromDiscord = exemptFromDiscord;
    }
    static fromJSON(json: any): User{
        return new User(json!.fullName, json!.email, json!.status, json!.donationCycle, json!.balance, json!.exemptFromDonations, json!.discordID, json!.exemptFromDiscord)
    }

    toJSON(): any{
        return {
            fullName: this.fullName || undefined,
            email: this.email,
            status: this.status,
            donationCycle: this.donationCycle,
            balance: this.balance,
            exemptFromDonations: this.exemptFromDonations,
            discordID: this.discordID || undefined,
            exemptFromDiscord: this.exemptFromDiscord
        }
    }

}