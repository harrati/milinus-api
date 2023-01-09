import { TasksService } from './tasks.service'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule],
  providers: [TasksService],
})
export class TasksModule {}
