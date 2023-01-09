import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserService } from './user.service'
import { User } from './user.entity'
import { UserResolver } from './user.resolver'
import { UserLoader } from './user.loader'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, UserResolver, UserLoader],
  exports: [UserService],
})
export class UserModule {}
