import * as path from 'path';
import { Module } from '@nestjs/common';
import { ExampleModule } from './example/example.module';
import { MessagingService } from './messaging/messaging.service';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { Auth0Module } from './auth0/auth0.module';
import { RabbitModule } from './common/modules/rabbit/rabbit.module';
import { HealthModule } from './health/health.module';
import { CommandModule } from './command/command.module';
import { CacheStoreModule } from './common/modules/cache/cache-store.module';
import { PubMessagingService } from './messaging/pub-messaging.service';
@Module({
  imports: [
    DatabaseModule.register(configuration.databases.default),
    Auth0Module,
    RabbitModule,
    ExampleModule,
    HealthModule,
    CacheStoreModule,
    CommandModule,
  ],
  providers: [MessagingService, PubMessagingService],
})
export class AppModule {}
