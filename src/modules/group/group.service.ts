import { Injectable } from '@nestjs/common'
import { Repository, DeepPartial } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { LibsService } from '../../libs/libs.service'
import { Group } from './group.entity'
import { Training } from '../training/training.entity'
import { OrderByDirection, WhereUniqueArgs } from '../../utils/types'
import { GroupCreateInput, GroupUpdateInput } from './group.inputs'
import { omit } from 'lodash'

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    public readonly groupRepository: Repository<Group>,
    private readonly libs: LibsService
  ) { }

  async getGroups(training: Training) {
    const groups = await this.groupRepository
      .createQueryBuilder('g')
      .where('g."trainingId" = :trainingId', { trainingId: training.id })
      .orderBy('g."createdAt"', OrderByDirection.ASC)
      .getMany()
    return groups
  }

  findByUuid(uuid: string) {
    return this.groupRepository.findOne({ uuid }, { relations: ['training'] })
  }

  deleteByUuid(uuid: string) {
    return this.groupRepository.delete({ uuid })
  }

  async createGroup(
    groupPayload: DeepPartial<GroupCreateInput>
  ): Promise<Group> {
    const group = this.groupRepository.create(groupPayload as DeepPartial<
      Group
    >)
    return await this.groupRepository.save(group)
  }

  async updateGroup(
    group: WhereUniqueArgs,
    payload: DeepPartial<GroupUpdateInput>
  ): Promise<Group> {
    await this.groupRepository.update(
      { uuid: group.uuid },
      { ...(payload as DeepPartial<Group>) }
    )
    const updatedGroup = await this.groupRepository.findOneOrFail({
      uuid: group.uuid,
    })
    return updatedGroup
  }

  async reorderGroup(training: Training, position: number, up: boolean) {
    await this.groupRepository
      .createQueryBuilder('g')
      .update()
      .set({
        position: () => `position ${up ? '+' : '-'} 1`,
      })
      .where('training = :id', { id: training.id })
      .andWhere('position >= :position', { position })
      .execute()
  }
  async copyGroup(group: Group) {
    const groupData: DeepPartial<Group> = {
      ...omit(group, ['id', 'uuid', 'position', 'createdAt', 'updatedAt']),
    }
    //shift positions after duplicate
    await this.groupRepository
      .createQueryBuilder('g')
      .update()
      .set({
        position: () => `position + 1`,
      })
      .where('training = :id', { id: group.training.id })
      .andWhere('position >= :p', { p: 1 + group.position })
      .execute()
    //set position of a duplicate
    groupData.position = 1 + group.position
    let duplicatedGroup = this.groupRepository.create(groupData)
    duplicatedGroup = await this.groupRepository.save(duplicatedGroup)
    return duplicatedGroup
  }
}
