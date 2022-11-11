import Key from './key';
export enum EntryType {
    FAILED = "failed",
    SUCCESSFUL = "successful"
}

export enum FailReason {
    UNKNOWN = "Unknown",
    KEY_EXPIRED = "KeyExpired",
    KEY_BLACKLISTED ="KeyBlacklisted",
    KEY_NOT_YET_ACTIVATED ="KeyNotYetActivated",
    ISSUING_DATE_IN_THE_FUTURE ="IssuingDateInTheFuture",
    SERIAL_NUMBER_MISMATCH = "SerialNumberMismatch"
}

export class Entry {
    public type: EntryType;
    public reason: FailReason | undefined;
    public key: Key;
    timestamp: Date;

    public metadata:{
        serialNumberFromTag?: string;
    }

    public toJSON(){
        return {
            type: this.type,
            reason: this.reason,
            key: this.key.id,
            timestamp: this.timestamp,
            metadata: this.metadata,
        }
    }

    public static fromJSON(json: any, entryType: EntryType): Entry {

        let entry = new Entry();

        let {id, expiresAt, issuedAt, notBefore, serialNumber, user} = json;

        let key = new Key();

        key.id = id;
        key.expiresAt = new Date(expiresAt * 1000);
        key.issuedAt = new Date(issuedAt * 1000);
        key.notBefore = new Date(notBefore * 1000);
        key.serialNumber = serialNumber;
        key.user = user;

        entry.key = key;

        entry.type = entryType;
        entry.reason = json.reason;
        entry.timestamp = new Date(json.timestamp * 1000);

        entry.metadata = {};

        if(json.serialNumberFromTag) entry.metadata.serialNumberFromTag = json.serialNumberFromTag;

        return entry;
    }

}