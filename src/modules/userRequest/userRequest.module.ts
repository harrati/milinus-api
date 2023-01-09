import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserRequestService } from './userRequest.service'
import { UserRequest } from './userRequest.entity'
import { UserRequestResolver } from './userRequest.resolver'
import { UserRequestLoader } from './userRequest.loader'

@Module({
  imports: [TypeOrmModule.forFeature([UserRequest])],
  providers: [UserRequestService, UserRequestResolver, UserRequestLoader],
  exports: [UserRequestService],
})
export class UserRequestModule {}
