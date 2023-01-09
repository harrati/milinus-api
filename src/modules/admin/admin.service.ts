import { Injectable } from '@nestjs/common'
import { DeepPartial, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { LibsService } from '../../libs/libs.service'
import { Admin } from './admin.entity'
import { v4 as uuidv4 } from 'uuid'
import { OrderByDirection, WhereUniqueInput } from '../../utils/types'
import { CreateAdminArgs, AdminUpdateDataInput } from './admin.inputs'

type AdminFilters = {
  search?: string
}
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) public readonly adminRepository: Repository<Admin>,
    private readonly libs: LibsService
  ) {}

  async findByEmail(email: string) {
    return await this.adminRepository.findOne({ email })
  }

  async findByUuid(uuid: string) {
    return await this.adminRepository.findOne({ uuid })
  }

  async deleteByUuid(uuid: string) {
    return await this.adminRepository.delete({ uuid })
  }

  async updateAndFetch(admin: Admin, payload: DeepPartial<Admin>) {
    await this.adminRepository.update(admin.id, payload)
    const updatedUser = await this.adminRepository.findOneOrFail(admin.id)
    return updatedUser
  }

  async createResetPasswordToken(email: string): Promise<Admin> {
    const resetPasswordToken = uuidv4()
    const admin = await this.adminRepository.findOneOrFail({ email })
    admin.resetPasswordToken = resetPasswordToken
    return await this.adminRepository.save(admin)
  }

  async resetPasswordToken(
    resetPasswordToken: string,
    password: string
  ): Promise<Admin> {
    const admin = await this.adminRepository.findOneOrFail({
      resetPasswordToken,
    })
    admin.resetPasswordToken = null
    admin.password = await this.libs.bcrypt.createCryptedPassword(password)
    return await this.adminRepository.save(admin)
  }

  async isPasswordResetTokenValid(
    resetPasswordToken: string
  ): Promise<boolean> {
    const admin = await this.adminRepository.findOne({
      resetPasswordToken,
    })
    return !!admin
  }
  async getAdmins(
    filters: AdminFilters,
    first = 10,
    last = 10,
    before?: string,
    after?: string
  ) {
    const qb = this.adminRepository.createQueryBuilder('admin')

    if (filters && filters.search) {
      qb.andWhere('LOWER(admin."firstName") LIKE :search', {
        search: `%${filters.search.toLowerCase()}%`,
      })
    }

    qb.orderBy('role', OrderByDirection.DESC)

    const paginator = this.libs.paginator.getPaginator(Admin, {
      first,
      after,
      before,
      last,
    })
    const connection = await paginator.manualPaginate(qb)
    return connection
  }

  async createAdmin(
    adminPayload: DeepPartial<CreateAdminArgs>
  ): Promise<Admin> {
    const resetPasswordToken = uuidv4()
    adminPayload.resetPasswordToken = resetPasswordToken
    const admin = this.adminRepository.create(adminPayload as DeepPartial<
      Admin
    >)
    return await this.adminRepository.save(admin)
  }

  async updateAdmin(
    admin: WhereUniqueInput,
    payload: DeepPartial<AdminUpdateDataInput>
  ): Promise<Admin> {
    await this.adminRepository.update(
      { uuid: admin.uuid },
      { ...(payload as DeepPartial<Admin>) }
    )
    const updatedAdmin = await this.adminRepository.findOneOrFail({
      uuid: admin.uuid,
    })
    return updatedAdmin
  }
}
