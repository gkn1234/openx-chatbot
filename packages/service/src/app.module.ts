import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AgentModule } from './agents/agent.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RequestInterceptor } from './interceptors/request-interceptor';
import { createWinstonLogger } from './utils/winston-config';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: () => createWinstonLogger(),
    }),
    AgentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
  ],
})
export class AppModule {}
