/* eslint-disable @typescript-eslint/camelcase */
import admin from 'firebase-admin'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import path from 'path'
import mime from 'mime-types'
import { ConfigService } from '@nestjs/config'
import { FirebaseConfig } from '../../config/config.types'

type FirebaseBucketDirectories = 'userProfilePictures'
type FirebaseDynamicLink = '/reset-password?resetPasswordToken'
type Notification = {
  title: string
  body: string
}
export type SendMulticast = {
  tokens: string[]
  data: any
  notification: Notification
}
@Injectable()
export class FirebaseService {
  constructor(private readonly config: ConfigService) {
    const { credentials } = this.config.get<FirebaseConfig>('firebase')
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: credentials.project_id,
        privateKey: credentials.private_key,
        clientEmail: credentials.client_email,
      }),
      storageBucket: 'gs://milinus.appspot.com',
    })
  }

  async uploadImageFromUrl(
    imageUrl: string,
    directory: FirebaseBucketDirectories,
    filename: string
  ): Promise<string> {
    const { data: readStream } = await axios.get(imageUrl, {
      responseType: 'stream',
    })

    const bucket = admin.storage().bucket()
    const file = bucket.file(`${directory}/${filename}`)

    const writeStream = file.createWriteStream({
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          firebaseStorageDownloadTokens: uuidv4(),
        },
      },
    })

    const result: Promise<string> = new Promise((resolve, reject) => {
      writeStream.on('error', function(err) {
        reject(err)
      })
      writeStream.on('finish', function() {
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${directory}%2f${filename}?alt=media`
        resolve(publicUrl)
      })
    })

    readStream.pipe(writeStream)
    return result
  }

  async uploadFileFromGraphQLUpload(
    graphQLFile: any,
    directory: string
  ): Promise<string> {
    const { createReadStream, mimetype } = await graphQLFile
    const stream = createReadStream()
    const filename = uuidv4()
    const dir = '/tmp'

    const fileAddress = path.join(
      dir,
      filename + '.' + mime.extension(mimetype)
    )
    const filePathTemp: Promise<string> = new Promise((resolve, reject) =>
      stream
        .on('error', (error: any) => {
          if (stream.truncated) fs.unlinkSync(fileAddress)
          reject(error)
        })
        .pipe(fs.createWriteStream(fileAddress))
        .on('error', (error: any) => reject(error))
        .on('finish', () => resolve(fileAddress))
    )
    const filePath = await filePathTemp
    const readStream = fs.createReadStream(filePath)

    const bucket = admin.storage().bucket()
    const file = bucket.file(`${directory}/${filename}`)

    const writeStream = file.createWriteStream({
      metadata: {
        contentType: mimetype,
        metadata: {
          firebaseStorageDownloadTokens: uuidv4(),
        },
      },
    })

    const result: Promise<string> = new Promise((resolve, reject) => {
      writeStream.on('error', function(err) {
        reject(err)
      })
      writeStream.on('finish', function() {
        fs.unlinkSync(filePath)
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${directory}%2f${filename}?alt=media`
        resolve(publicUrl)
      })
    })

    readStream.pipe(writeStream)
    return result
  }

  async uploadFileFromPath(
    filePath: string,
    directory: string
  ): Promise<string> {
    const filename = uuidv4()

    const readStream = fs.createReadStream(filePath)

    const bucket = admin.storage().bucket()
    const file = bucket.file(`${directory}/${filename}`)

    const writeStream = file.createWriteStream({
      metadata: {
        contentType: mime.contentType(filePath),
        metadata: {
          firebaseStorageDownloadTokens: uuidv4(),
        },
      },
    })

    const result: Promise<string> = new Promise((resolve, reject) => {
      writeStream.on('error', function(err) {
        reject(err)
      })
      writeStream.on('finish', function() {
        fs.unlinkSync(filePath)
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${directory}%2f${filename}?alt=media`
        resolve(publicUrl)
      })
    })

    readStream.pipe(writeStream)
    return result
  }

  async createDynamicLink(dynamicLinkType: FirebaseDynamicLink, value: string) {
    const {
      webApiKey,
      dynamicLinks: { domainUriPrefix, shortLinksUrl },
    } = this.config.get<FirebaseConfig>('firebase')
    const { ios, android, frontUrl } = this.config.get('release')
    const { data } = await axios.post<{ shortLink: string }>(
      shortLinksUrl,
      {
        dynamicLinkInfo: {
          domainUriPrefix: domainUriPrefix,
          link: `${frontUrl}${dynamicLinkType}=${value}`,
          androidInfo: { androidPackageName: android.packageName },
          iosInfo: { iosBundleId: ios.bundleId },
          navigationInfo: { enableForcedRedirect: true },
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        params: { key: webApiKey },
      }
    )
    return data.shortLink
  }

  async sendMulticast({
    tokens,
    notification,
    data,
  }: SendMulticast): Promise<admin.messaging.BatchResponse> {
    return admin.messaging().sendMulticast({
      tokens,
      android: {
        notification: notification,
        data: {
          ...data,
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              body: notification.body,
              title: notification.title,
            },
            badge: 1,
            sound: 'default',
          },
          ...data,
        },
      },
    })
  }
}
