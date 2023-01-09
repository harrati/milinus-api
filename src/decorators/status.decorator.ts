import { SetMetadata } from '@nestjs/common'
import { UserStatus } from '../modules/user/user.types'

export const Status = (...status: UserStatus[]) => SetMetadata('status', status)
