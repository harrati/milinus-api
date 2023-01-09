import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProgramResolver } from './program.resolver'
import { ProgramService } from './program.service'
import { Program } from './program.entity'
import { ProgramLoader } from './program.loader'
import { ProgramOrderingService } from './program.ordering.service'
import { UserProgram } from '../userProgram/userProgram.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Program, UserProgram])],
  providers: [
    ProgramService,
    ProgramResolver,
    ProgramLoader,
    ProgramOrderingService,
  ],
  exports: [
    ProgramResolver,
    ProgramService,
    TypeOrmModule.forFeature([Program]),
  ],
})
export class ProgramModule {}
