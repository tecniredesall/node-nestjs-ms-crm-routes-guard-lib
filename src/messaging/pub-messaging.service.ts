import configuration from '@app/config/configuration';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

export interface RabbitMQErrorMessage {
  error: {
    message: string;
    [key: string]: unknown;
  };
}

@Injectable()
export class PubMessagingService {
  constructor(private readonly amqpConnection: AmqpConnection) {}
  //publish message into generic routing key
  public async sendExchange(routingKey, message) {
    await this.amqpConnection.publish(
      configuration.rabbitmq.exchange,
      routingKey,
      message,
    );
  }

  /**
   * In case there is an async error happening, send it to this queue for future
   * analysis.
   * @param error
   */
  public async sendError(error: RabbitMQErrorMessage) {
    await this.amqpConnection.publish(
      configuration.rabbitmq.exchange,
      configuration.rabbitmq.errorsRoutingKey,
      {
        ...error,
        ms_name: configuration.rabbitmq.queue,
        created_at: new Date(),
      },
    );
  }
}
