import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe, VERSION_NEUTRAL, VersioningType} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {WINSTON_MODULE_NEST_PROVIDER, WinstonModule} from 'nest-winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {getLogFormat, logLevel} from './commom/logger/winston.config';
import * as winston from 'winston';
// import {winstonLogger} from "./logger/logger.module";
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
        logger: //winstonLogger
            WinstonModule.createLogger({
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

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );

    app.enableVersioning({
      type: VersioningType.URI,
      //fixme: default 설정으로 모든 contoller 버전 컨트롤
      // defaultVersion: [VERSION_NEUTRAL],
      // defaultVersion: '2',
    });

    const swaggerOptions = new DocumentBuilder()
        .setTitle(configService.get('SWAGGER_TITLE'))
        .setDescription(configService.get('SWAGGER_DESC'))
        .setVersion(configService.get('SWAGGER_VERSION'))
        // .addTag('blockchain')
        // .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, swaggerOptions);
    SwaggerModule.setup(configService.get('SWAGGER_PATH'), app, document);

    await app.listen(configService.get('APP_PORT'));
}

bootstrap();
