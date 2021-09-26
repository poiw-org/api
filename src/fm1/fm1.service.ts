import client from '../providers/mongo.providers';
import { customAlphabet } from 'nanoid';
import { SMTPClient } from "emailjs"
import {log} from "util";

const code_generator = customAlphabet('0123456789', 6);
const token_generator = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 128);

const smtp_username='prism@poiw.org'
const smtp_password='^q4jxZ53GzRVH8Ux'
const smtp_host='mailer.poiw.org'

export default {
    async getApplications(): Promise<object[]> {
      await client.connect();

      return await client.db('fm1')
          .collection('applications')
          .find()
          .toArray();
    },

    async editApplication(application: any): Promise<boolean | string> {
        await client.connect();

        const exists = await client
          .db('fm1')
          .collection('applications')
          .findOne({ _id: application._id });

        if (exists?.length == 0) return false;

        if (!application.email)
            return 'Δεν βρέθηκε το email.';

        if(!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(application.email)))
            return 'Το email δεν είναι έγκυρο.';

        if(!application.mobile)
            return 'Δεν βρέθηκε αριθμός τηλεφώνου.';

        if(!application.fullName)
            return 'δεν βρέθηκε ονοματεπώνυμο.';

        if(!application.artistsList)
            return 'δεν βρέθηκε η λίστα με τους καλλιτέχνες.';

        await client
          .db('fm1')
          .collection('applications')
          .updateOne({ _id: application._id }, { $set: application });
        return true;
    },

    async deleteApplication(application: any): Promise<boolean | string> {
        await client.connect();

        await client.db('fm1').collection('applications').deleteOne({ _id: application._id });
        return true;
    },

    async deleteApplications(): Promise<boolean | string> {
        await client.connect();

        await client.db('fm1').collection('applications').deleteMany();
        return true;
    },

    async sendVerificationCode(email: string): Promise<boolean | string> {
        if (!email)
            return 'Δεν βρέθηκε το email.';

        // if(!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email)))
        //     return 'Το email δεν είναι έγκυρο.';

        let verificationCode = code_generator();

        await client.connect();
        await client.db('fm1').collection('auth').updateOne({email}, {
        $set:{email, verificationCode, otp_ts: Date.now()}}, {upsert: true});

        const smtpClient = new SMTPClient({
            user: smtp_username,
            password: smtp_password,
            host: smtp_host,
            ssl: true,
        });

        if(process.env.NODE_ENV === "production") smtpClient.send(
          {
              text: `Ο κωδικός επιβεβαίωσης σου για το studio FM1 είναι: ${verificationCode}\n`,
              //@ts-ignore
              from: 'FM1 <noreply@poiw.org>',
              to: email,
              subject: 'Επιβεβαίωση email για το studio FM1',
          }, async (err, message) => {});
        else console.log(`Ο κωδικός επιβεβαίωσης για το email ${email} είναι ${verificationCode}`);

        return true
    },

    async verifyEmail(email: string, verificationCode: string): Promise<object | string> {
        await client.connect();
        // verify code and return token, previous application data
        if(!email)
            return 'Δεν βρέθηκε το email';

        if(!verificationCode)
            return 'Δεν βρέθηκε το verificationCode';

        let authData = await client.db('fm1').collection('auth').findOne({email})
        if(!authData) return 'Το email δεν είναι καταχωρημένο.';

        if(authData.token)
            await client.db('fm1').collection('auth').deleteMany({email})

        // Compare verification codes - Check for timestamp
        if(verificationCode !== authData.verificationCode || Date.now() - authData.otp_ts > 10 * 60 * 1000)
            return 'Ο κωδικός δεν είναι έγκυρος.';

        await client.db('fm1').collection('auth').deleteMany({email})

        authData.token = token_generator();
        await client.db('fm1').collection('auth').updateOne({email}, { $set: {token: authData.token, token_ts: Date.now()}});

        return { token: authData.token }
    },

    async apply(token: string, application: any): Promise<boolean | string> {
        let email = application.email
        let mobile = application.mobile;
        let fullName = application.fullName;
        let artistsList = application.artistsList;

        if(!email) return 'Δεν βρέθηκε το email';
        // if(!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email)))
        //     return 'Το email δεν είναι έγκυρο.';
        if(!mobile) return 'Δεν βρέθηκε αριθμός τηλεφώνου.';
        if(!fullName) return 'δεν βρέθηκε ονοματεπώνυμο.';
        if(!artistsList) return 'δεν βρέθηκε η λίστα με τους καλλιτέχνες.';
        if(!token) return 'Δεν βρέθηκε το token';

        let authData = await client.db('fm1').collection('auth').findOne({email})
        if(!authData) return 'Το email δεν είναι καταχωρημένο.';

        // Compare verification codes - Check for timestamp
        if(token !== authData.token || Date.now() - authData.token_ts > 6 * 60 * 60 * 1000)
            return 'Το token δεν είναι έγκυρο.';

        await client.db('fm1').collection('applications').updateOne({email}, { $set: {email, mobile, fullName, artistsList} }, {upsert: true});
        return true;
    },

    async deleteAuth(email: string, token: string): Promise<boolean> {
        await client.db('fm1').collection('auth').deleteOne({email, token})
        return true
    },

    async getPreviousApplication(email: string, token: string): Promise<object | string> {
        let authData = await client.db('fm1').collection('auth').findOne({email})
        if(!authData) return 'Το email δεν είναι καταχωρημένο.';

        // Compare verification codes - Check for timestamp
        if(token !== authData.token || Date.now() - authData.token_ts > 6 * 60 * 60 * 1000)
            return 'Το token δεν είναι έγκυρο.';

        let application = await client.db('fm1').collection('applications').findOne({email});
        return { application };
    }

}
