import * as stream from "stream";

import {ApplicationStates} from "./applicationStates";
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import {SMTPClient} from "emailjs"
// import {uploadAndGetPublicFile} from "../providers/storage"
import {Storage} from "@google-cloud/storage";
import client from '../providers/mongo.providers';
import {customAlphabet} from 'nanoid';
import {log} from "util";

const code_generator = customAlphabet('0123456789', 6);
const token_generator = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 128);
const filename_generator = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 32);

const token_expires = 10 * 60 * 60 * 1000

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
        await client.db('fm1').collection('auth').deleteMany({email})
        await client.db('fm1').collection('auth').insertOne({email, verificationCode, otp_ts: Date.now()});

        const smtpClient = new SMTPClient({
            user: process.env.SMTP_USERNAME,
            password: process.env.SMTP_PASSWORD,
            host: process.env.SMTP_HOST,
            ssl: true,
            timeout: 999999999999999999
        });

        if(process.env.NODE_ENV != "development")
            smtpClient.send({
              text: `Ο κωδικός επιβεβαίωσης σου για το studio FM1 είναι: ${verificationCode}\n`,
              //@ts-ignore
              from: 'FM1 <noreply@poiw.org>',
              to: email,
              subject: 'Επιβεβαίωση email για το studio FM1',
          }, async (err, message) => console.log(err));
        else console.log(`Ο κωδικός επιβεβαίωσης για το email ${email} είναι ${verificationCode}`);

        return true
    },

    async verifyEmail(email: string, verificationCode: string): Promise<object | string> {
        await client.connect();
        // verify code and return token, previous application data
        if(!email) return 'Δεν βρέθηκε το email';
        if(!verificationCode) return 'Δεν βρέθηκε το verificationCode';

        let authData = await client.db('fm1').collection('auth').findOne({email});
        if(!authData) return 'Το email δεν είναι καταχωρημένο.';

        // Compare verification codes - Check for timestamp
        if(verificationCode !== authData.verificationCode || Date.now() - authData.otp_ts > 10 * 60 * 1000)
            return 'Ο κωδικός δεν είναι έγκυρος.';

        if(authData.token)
            return {token: authData.token};

        await client.db('fm1').collection('auth').deleteMany({email});
        let token = token_generator();
        let token_ts = Date.now();
        await client.db('fm1').collection('auth').insertOne({email, token, token_ts});
        return {token, expires: token_ts + token_expires};
    },

    async apply(token: string, application: any, response: Response): Promise<Response | string> {
        await client.connect();

        let email = application.email
        let mobile = application.mobile;
        let fullName = application.fullName;
        let artistsList = application.artistsList; // base64
        let musicGenre = application.musicGenre;
        let school = application.school;

        if(!email) return 'Δεν βρέθηκε το email';
        // if(!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email)))
        //     return 'Το email δεν είναι έγκυρο.';
        if(!mobile) return response.status(HttpStatus.NOT_ACCEPTABLE).send('Δεν βρέθηκε αριθμός τηλεφώνου.');
        if(!fullName) return response.status(HttpStatus.NOT_ACCEPTABLE).send('Δεν βρέθηκε ονοματεπώνυμο.');
        if(!artistsList) return response.status(HttpStatus.NOT_ACCEPTABLE).send('Πρέπει να ανεβάσεις τη λίστα με τους καλλιτέχνες.');
        if(!token) return response.status(HttpStatus.NOT_ACCEPTABLE).send('Δεν ήταν δυνατή η ταυτοποίηση σου. Προσπάθησε να ανανεώσεις τη σελίδα και προσπάθησε πάλι.');
        if(!school) return response.status(HttpStatus.NOT_ACCEPTABLE).send('Πρέπει να δηλώσεις σε ποιό τμήμα σπουδάζεις.');
        if(!musicGenre) return response.status(HttpStatus.NOT_ACCEPTABLE).send('Πρέπει να δηλώσεις ποιο είδος μουσικής θέλεις να παίζεις (κατα κύριο λόγο) στον σταθμό.');

        let authData = await client.db('fm1').collection('auth').findOne({email})
        if(!authData) return response.status(HttpStatus.UNAUTHORIZED).send('Το email δεν είναι καταχωρημένο.');

        // Compare verification codes - Check for timestamp
        if(!token || token !== authData.token || Date.now() - authData.token_ts > token_expires)
            return 'Το token δεν είναι έγκυρο.';

        let contentType = artistsList.split(',')[0].split(':')[1]?.split(';')[0];
        let fileType = artistsList.split(',')[0].split(':')[0];
        console.log(contentType)
        if(fileType != "pdf" || contentType != "application/pdf") return response.status(HttpStatus.NOT_ACCEPTABLE).send('Η λίστα που θα ανεβάσεις, πρέπει υποχρεωτικά να είναι σε μορφή pdf!');
        let filename = filename_generator() + '.' + fileType

        // let fileURL = await uploadAndGetPublicFile(filename,artistsList.split(',')[1],contentType);
        const storage = new Storage(process.env.NODE_ENV === "development" ? {
            projectId: process.env.GCS_PROJECT_ID,
            keyFilename: "./poiw-290908-c8bd5b74fe42.json"
        }:{});
        const myBucket = storage.bucket(process.env.GCS_BUCKET);

        const file = myBucket.file(`fm1-applicants/${filename}`);

        const fileOptions = {
            metadata: { contentType: contentType },
        }
        const base64EncodedString = artistsList.replace(/^data:\w+\/\w+;base64,/, '')
        var bufferStream = new stream.PassThrough();
        bufferStream.end(Buffer.from(base64EncodedString, 'base64'));
        console.log(filename)
        await bufferStream.pipe(file.createWriteStream({
            metadata: {
                contentType: contentType,
                metadata: {
                    custom: 'metadata'
                }
            },
            public: true,
        }))

        await client.db('fm1').collection('applications').updateOne({email}, {
            $set: {
                email,
                mobile,
                fullName,
                applicationStatus: ApplicationStates.PENDING_REVIEW,
                school,
                musicGenre,
                artistsList: process.env.GCS_STORAGE_URL + "fm1-applicants/" + filename
            }
        }, {upsert: true});

        const smtpClient = new SMTPClient({
            user: process.env.SMTP_USERNAME,
            password: process.env.SMTP_PASSWORD,
            host: process.env.SMTP_HOST,
            ssl: true,
            timeout: 999999999999999999
        });

        if(process.env.NODE_ENV != "development")
            smtpClient.send({
                text: `Ονοματεπώνυμο: ${fullName}\nEmail: ${email}\nΚινητό: ${mobile}\nΣχολή: ${school}\nΕίδος: ${musicGenre}\nΛίστα: ${process.env.GCS_STORAGE_URL + "fm1-applicants/" + filename}\nΏρα επεξεργασίας αιτήματος: ${new Date()}`,
                //@ts-ignore
                from: 'FM1 <noreply@poiw.org>',
                to: "studiofm1@outlook.com",
                subject: 'Νέα αίτηση υποψήφιου παραγωγού',
            }, async (err, message) => console.log(err));

        return response.status(200).send("OK");
    },

    async deleteAuth(email: string, token: string): Promise<boolean> {
        await client.db('fm1').collection('auth').deleteOne({email, token})
        return true
    },

    async getPreviousApplication(email: string, token: string): Promise<object | string> {
        await client.connect();

        let authData = await client.db('fm1').collection('auth').findOne({email})
        if(!authData) return 'Το email δεν είναι καταχωρημένο.';

        // Compare verification codes - Check for timestamp
        if(!token || token !== authData.token || Date.now() - authData.token_ts > 6 * 60 * 60 * 1000)
            return 'Το token δεν είναι έγκυρο.';

        let application = await client.db('fm1').collection('applications').findOne({email});
        return { application };
    }

}
