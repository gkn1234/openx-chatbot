import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { env } from 'node:process';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { readEnv } from './utils';

async function bootstrap() {
  readEnv();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // API 路由前缀
  app.setGlobalPrefix('api');

  // 生产环境直接提供静态文件
  app.useStaticAssets(join(__dirname, 'client'));

  app.use((req, res, next) => {
    if (req.method === 'GET' &&
      !req.path.startsWith('/api') && // 你的API前缀
      !req.path.includes('.') // 跳过静态文件请求
    ) {
      res.sendFile(join(__dirname, 'client', 'index.html'));
    }
    else {
      next();
    }
  });

  const config = new DocumentBuilder()
    .setTitle('接口文档')
    .setDescription('描述')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.useBodyParser('json', { limit: '50mb' });
  await app.listen(env.PORT ?? 3025);
}
bootstrap();
