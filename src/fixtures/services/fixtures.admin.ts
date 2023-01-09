import { Injectable } from '@nestjs/common'
import times from 'lodash/times'
import { InjectConnection } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import * as faker from 'faker/locale/fr'
import { LibsService } from '../../libs/libs.service'
import { Admin } from '../../modules/admin/admin.entity'
import { AdminRoles } from '../../modules/admin/admin.types'

@Injectable()
export class FixturesAdminService {
  private readonly repository: Repository<Admin>

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly lib: LibsService
  ) {
    this.repository = connection.getRepository(Admin)
  }

  async injectAdmins(): Promise<Admin[]> {
    console.log('seeding admins...')
    const admins = await Promise.all<Admin>(
      times(15, async n => {
        const password = await this.lib.bcrypt.createCryptedPassword('totem')
        const admin = this.repository.create({
          email: `poubelle+${n}@totem.paris`,
          role: n < 5 ? AdminRoles.SUPER_ADMIN : AdminRoles.ADMIN,
          password: password,
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
        })
        return admin
      })
    )
    return this.repository.save(admins)
  }
}
