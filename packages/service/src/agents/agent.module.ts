import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';

@Module({
  controllers: [AgentController],
  providers: [AgentService, PrismaService],
})
export class AgentModule {}
