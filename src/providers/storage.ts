
import { join } from 'path'
import { get } from 'lodash'
import { Storage } from '@google-cloud/storage'

const gcloudPathKey = join(__dirname, '../gcloud-key.json')

const storage = new Storage({
    projectId: 'my-project-id',
    keyFilename: "./poiw-290908-c8bd5b74fe42.json"
})

export const uploadAndGetPublicFile = async (
    fileName: string,
    data: Blob | string,
    defaultMimeType?: string
) => {

    const [bucketExist] = await storage
        .bucket(process.env.GCS_BUCKET)
        .exists();
    if (!bucketExist) {
        await storage.createBucket(process.env.GCS_BUCKET);
    }

    const file = storage
        .bucket(process.env.GCS_BUCKET)
        .file(fileName);

    const fileOptions = {
        public: true,
        resumable: false,
        metadata: { contentType: defaultMimeType },
        validation: false
    }
    if (typeof data === 'string') {
        const base64EncodedString = data.replace(/^data:\w+\/\w+;base64,/, '')
        const fileBuffer = Buffer.from(base64EncodedString, 'base64')
        await file.save(fileBuffer, fileOptions);
    } else {
        await file.save(get(data, 'buffer', data), fileOptions);
    }
    const publicUrl = `${process.env.GCS_STORAGE_URL}/${fileName}`

    const [metadata] = await file.getMetadata()
    return {
        ...metadata,
        publicUrl
    }
}

export default storage