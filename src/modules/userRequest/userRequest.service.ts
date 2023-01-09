import { Injectable, forwardRef, Inject } from '@nestjs/common'
import { DeepPartial, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { LibsService } from '../../libs/libs.service'
import { UserRequest } from './userRequest.entity'
import { OrderByDirection } from '../../utils/types'
import { RequestStatus, RequestCategory } from './userRequest.types'
import { ReposService } from '../repos.service'
import { omit } from 'lodash'
import { RequestWhereInput } from './userRequest.inputs'
import { User } from '../user/user.entity'
import { UserLanguage } from '../user/user.types'

@Injectable()
export class UserRequestService {
  constructor(
    @InjectRepository(UserRequest)
    public readonly userRequestRepository: Repository<UserRequest>,
    private readonly libs: LibsService,
    @Inject(forwardRef(() => ReposService))
    public readonly repos: ReposService
  ) {}

  async getRequests(where: RequestWhereInput, first = 10, after?: string) {
    const qb = this.userRequestRepository.createQueryBuilder('userrequest')

    if (where && where.category) {
      qb.where('userrequest.category = :category', { category: where.category })
    }

    const paginator = this.libs.paginator.getPaginator(UserRequest, {
      orderBy: 'id',
      orderByDirection: OrderByDirection.DESC,
      first,
      after,
    })
    return await paginator.paginate(qb)
  }

  async loadUser(userRequest: UserRequest) {
    const { user } = await this.userRequestRepository.findOneOrFail(
      userRequest.id,
      { relations: ['user'] }
    )
    return user
  }

  getPendingRequests() {
    return this.userRequestRepository.find({
      where: {
        status: RequestStatus.PENDING,
        category: RequestCategory.DATA_REQUEST,
      },
      relations: ['user'],
    })
  }

  async processRequest(request: UserRequest) {
    const { user } = request
    const userToString = JSON.stringify(
      omit(user, [
        'password',
        'resetPasswordToken',
        'id',
        'appleId',
        'facebookId',
      ])
    )
    const userToBase64 = Buffer.from(userToString).toString('base64')
    const attachments = [
      {
        ContentType: 'application/json',
        Filename: 'data.json',
        Base64Content: userToBase64,
      },
    ]
    const template =
      user.language === UserLanguage.FR ? 'dataRequest' : 'dataRequestEN'
    this.libs.mailjet.send(template, user, null, attachments)
    await this.updateUserRequest(request, { status: RequestStatus.PROCESSED })
  }

  async createUserRequest(user: User, payload: DeepPartial<UserRequest>) {
    const userRequest = this.userRequestRepository.create(payload)
    await this.userRequestRepository.save(userRequest)
    return userRequest
  }

  async updateUserRequest(
    request: UserRequest,
    payload: DeepPartial<UserRequest>
  ) {
    await this.userRequestRepository.update({ id: request.id }, payload)
  }
}
