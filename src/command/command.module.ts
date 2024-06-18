import { CacheModule, Module } from '@nestjs/common';
import { CommandModule as Command } from 'nestjs-command';
import { makeImports, makeRepository } from '@app/common/repositories';
import { S3Service } from '@app/aws/s3.service';
import { ExampleService } from '@app/example/example.service';
import { ExampleMongoRepository } from '@app/example/repositories/example.mongo.repository';
import { ExampleRealmRepository } from '@app/example/repositories/example.realm.repository';
import { PubMessagingService } from '@app/messaging/pub-messaging.service';
import { MsformsValidatorService } from '@app/validations/msforms-validator.service';
import { ExampleSchema } from '@app/example/schemas/example.schema.mongo';
import { ExampleCommand } from '@app/database/seeders/example.command';
@Module({
  imports: [
    Command,
    ...makeImports([
      {
        name: 'Example',
        schema: ExampleSchema,
        collection: 'Example',
      },
    ]),
    CacheModule.register(),
  ],
  providers: [
    PubMessagingService,
    ExampleService,
    MsformsValidatorService,
    S3Service,
    {
      provide: ExampleMongoRepository,
      useClass: makeRepository(ExampleMongoRepository, ExampleRealmRepository),
    },
    ExampleCommand,
  ],
})
export class CommandModule {}
