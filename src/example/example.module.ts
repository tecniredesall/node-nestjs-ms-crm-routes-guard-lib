import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ExampleService } from './example.service';
import { ExampleController } from './example.controller';
import { FilterPaginateMiddleware } from './../common/middleware/req-filterpaginate.middleware';
import { S3Service } from '@app/aws/s3.service';
import { ExampleMongoRepository } from './repositories/example.mongo.repository';
import { ExampleSchema } from './schemas/example.schema.mongo';
import { ExampleRealmRepository } from './repositories/example.realm.repository';
import { makeImports, makeRepository } from '@app/common/repositories';
import { PubMessagingService } from '@app/messaging/pub-messaging.service';
import { MsformsValidatorService } from '@app/validations/msforms-validator.service';
import { CacheService } from '@app/cache/cache.service';
import { CacheStoreModule } from '@app/common/modules/cache/cache-store.module';
import { OTPNotification } from '@app/notifications/example/otp.notification';


@Module({
  imports: [
    ...makeImports([
      {
        name: 'Example',
        schema: ExampleSchema,
        collection: 'Example',
      },
    ]),
    CacheStoreModule,
  ],
  controllers: [ExampleController],
  providers: [
    PubMessagingService,
    ExampleService,
    MsformsValidatorService,
    S3Service,
    CacheService,
    {
      provide: ExampleMongoRepository,
      useClass: makeRepository(ExampleMongoRepository, ExampleRealmRepository),
    },
    OTPNotification,
    //PrismaService, //if you need to use prism uncomment
  ],
})
export class ExampleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FilterPaginateMiddleware).forRoutes('/');
  }
}
