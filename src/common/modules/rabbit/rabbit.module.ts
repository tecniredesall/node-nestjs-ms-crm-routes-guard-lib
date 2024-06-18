import configuration from '@app/config/configuration';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: configuration.rabbitmq.exchange,
          type: configuration.rabbitmq.exchangeType,
        },
      ],
      uri: configuration.rabbitmq.uri,
      connectionInitOptions: { wait: true },
      enableControllerDiscovery: true,
    }),
    RabbitModule,
  ],
  providers: [],
  controllers: [],
  exports: [RabbitMQModule],
})
export class RabbitModule {}
