import { Injectable } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import configuration from './../config/configuration';
import { PubMessagingService } from './pub-messaging.service';

@Injectable()
export class MessagingService {
  constructor(private readonly pubMessaging: PubMessagingService) {}

  @RabbitSubscribe({
    exchange: configuration.rabbitmq.exchange,
    routingKey: configuration.rabbitmq.routingKey,
    queue: configuration.rabbitmq.queue,
  })
  public async pubSubNew(msg: any, amqpMsg: ConsumeMessage) {
    let routingKey;
    try {
      routingKey = amqpMsg?.fields?.routingKey;
      console.log(amqpMsg);
      console.log(`message to create person: ${JSON.stringify(msg, null, 3)}`);

      /** Handle messages here */
    } catch (error) {
      const errorMsg = {
        error: {
          message: error.message || error,
          routing_key: routingKey,
          payload: msg,
        },
      };
      this.pubMessaging.sendError(errorMsg);
      console.log(errorMsg);
      return new Nack();
    }
  }

  @RabbitSubscribe({
    exchange: configuration.rabbitmq.exchange,
    routingKey: 'users.create',
    queue: 'users',
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async pubSubUsers(msg: any, amqpMsg: ConsumeMessage) {
    console.log(`message of the  user queue: ${JSON.stringify(msg, null, 3)}`);
  }
}
