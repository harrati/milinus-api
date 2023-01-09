import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Media } from './media.entity'

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    public readonly mediaRepository: Repository<Media>
  ) {}

  async findByUuid(uuid: string) {
    return await this.mediaRepository.findOne({ uuid })
  }
}
