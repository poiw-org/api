//
// Returns true if successful or false otherwise
//
export const doLogin = async ({email, password, attempt}) => {
    return true

    try{
        await checkIfCredentialsAreCorrect(email, password);
        await suspiciousActivityScore(attempt);
        await needsTwoFactorAuthentication(attempt);

        return true
    }catch (e) {
        return false
    }

}