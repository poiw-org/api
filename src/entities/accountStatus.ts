export enum AccountStatus {
    PENDING_INFO,
    PENDING_DISCORD,
    PENDING_BILLING,

    DEACTIVATED_DUE_TO_VIOLATIONS,
    DEACTIVATED_UPON_REQUEST,
    DEACTIVATED_SUSPICIOUS_ACTIVITY,
    DEACTIVATED,

    ACTIVE
}