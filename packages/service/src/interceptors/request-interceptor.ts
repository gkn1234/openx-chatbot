import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger!: LoggerService;

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    // 请求开始时间
    const start = Date.now();
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    // 得到请求头信息
    const headers: Record<string, any> = request.headers;
    const urlInfo = `${request.method} ${request.url}`;

    const requestId = request.headers['X-Request-Id'] || nanoid();
    response.setHeader('X-Request-Id', requestId);

    this.logger.log(`Request: ${urlInfo}`, {
      id: requestId,
      host: headers.host,
      body: request.body,
    });

    return next
      .handle()
      .pipe(
        tap(() => {
          this.logger.log(`Response: ${urlInfo}`, {
            id: requestId,
            host: headers.host,
            responseTime: Date.now() - start,
            status: response.statusCode,
          });
        }),
      );
  }
}
