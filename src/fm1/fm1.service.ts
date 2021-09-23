
export default {
    async getApplications(): Promise<object[]> {
        return []
    },

    async editApplication(application: any): Promise<boolean | string> {
        return true
    },

    async deleteApplication(application: any): Promise<boolean | string> {
        return true
    },

    async deleteApplications(): Promise<boolean | string> {
       return true
    },

    async sendVerificationCode(email: string): Promise<boolean | string> {
      return true
    },

    async verifyEmail(email: string, code: string): Promise<object | string> {
        return {}
    },

    async apply(token: string, application: object): Promise<boolean | string> {
        return true
    }

}
