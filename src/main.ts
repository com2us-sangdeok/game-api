import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  VERSION_NEUTRAL,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import { getLogFormat, logLevel } from './logger/winston.config';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { json, urlencoded } from 'express';
import {BetaGameModule} from "./beta-game-api/beta-game.module";
import {GameCommonApiModule} from "./game-common-api/game-common-api.module";
/*
  todo:
    + Config
    + DB Connection
    + Blockchain Connection
    + Versioning
    + Swagger
    + Logger // log rotate
    Security (auth)
    Exception / Error
    File
    Filter
    Transform pipe
    validation pipe / class validation
    http client
    distributed tracing (OpenTracing, Jaeger)
    rate limiting (@nestjs/throttler )
    + Request context
    gRPC
 */
async function bootstrap() {
  const appOptions = {
    cors: true,
    bodyParser: true,
    //winstonLogger
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          level: logLevel(process.env.NODE_ENV),
          format: getLogFormat(process.env.NODE_ENV),
        }),
      ],
    }),
  };
  const app = await NestFactory.create(AppModule, appOptions);
  const configService = app.get(ConfigService);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  // app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.setGlobalPrefix(configService.get('APP_ROOT_PREFIX'));
  app.enableVersioning({
    type: VersioningType.URI,
    //fixme: default 설정으로 모든 contoller 버전 컨트롤
    // defaultVersion: [VERSION_NEUTRAL],
    // defaultVersion: '2',
  });

  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ limit: '100mb', extended: true }));

  const swaggerOptions = new DocumentBuilder()
    .setTitle(configService.get('SWAGGER_TITLE'))
    .setDescription(configService.get('SWAGGER_DESC'))
    .setVersion(configService.get('SWAGGER_VERSION'))
    // .addTag('blockchain')
    // .addBearerAuth()
    .build();

  const option: SwaggerDocumentOptions = {
    include: [
      /** 웹뷰 API */
      GameCommonApiModule,
    ],
    deepScanRoutes: false,
  };

  const document = SwaggerModule.createDocument(app, swaggerOptions, option);
  SwaggerModule.setup(configService.get('SWAGGER_PATH'), app, document);

  await app.listen(configService.get('APP_PORT'));
}

bootstrap();
