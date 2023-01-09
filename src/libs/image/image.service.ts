/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AssetsConfig } from '../../config/config.types'
import Jimp from 'jimp'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class ImageService {
  private watermarkFile: string

  constructor(private readonly config: ConfigService) {
    const { watermark } = config.get<AssetsConfig>('assets')
    this.watermarkFile = watermark
  }

  async watermark(originalImage: string) {
    const logoMarginPercentageRight = 11
    const logoMarginPercentageBottom = 10

    const fileName = `/tmp/${uuidv4()}.jpg`

    const image = await Jimp.read(originalImage)
    const logo = await Jimp.read(this.watermarkFile)

    logo.resize(image.bitmap.width / 6.5, Jimp.AUTO)

    const xMargin = (image.bitmap.width * logoMarginPercentageRight) / 100
    const yMargin = (image.bitmap.width * logoMarginPercentageBottom) / 100

    const X = image.bitmap.width - logo.bitmap.width - xMargin
    const Y = image.bitmap.height - logo.bitmap.height - yMargin

    const watermarkedImage = image.composite(logo, X, Y, {
      mode: Jimp.BLEND_DESTINATION_OVER,
      opacitySource: 1,
      opacityDest: 0.25,
    })

    watermarkedImage.write(fileName)
    return fileName
  }

  async thumbnail(originalImage: string) {
    const fileName = `/tmp/${uuidv4()}.png`

    const image = await Jimp.read(originalImage)

    image.scaleToFit(256, 256)
    image.write(fileName)

    return fileName
  }
}
