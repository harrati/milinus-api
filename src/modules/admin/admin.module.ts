import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Admin } from './admin.entity'
import { AdminService } from './admin.service'
import { AdminResolver } from './admin.resolver'
import { AdminController } from './admin.controller'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [TypeOrmModule.forFeature([Admin]), ConfigModule],
  controllers: [AdminController],
  providers: [AdminService, AdminResolver],
  exports: [TypeOrmModule.forFeature([Admin]), AdminService],
})
export class AdminModule {}
