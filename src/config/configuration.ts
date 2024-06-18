import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot();

const default_queue = process.env.RABBITMQ_QUEUE_DEFAULT || 'crm-example';

export default {
  port: parseInt(process.env.PORT, 10) || 3000,
  prefix: '/crm-lib/api',
  environment: process.env.NODE_ENV,
  databases: {
    mongo: {
      uri: process.env['MONGO_CONNECTION'],
    },
    realm: {
      appId: process.env['REALM_APP_ID'] || '',
      partitionKey: process.env['REALM_PARTITION_KEY'] || '',
      authToken: process.env['REALM_AUTH0_TOKEN'] || '',
      behavior: {
        type: 'openImmediately',
        timeOut: 15000,
        timeOutBehavior: 'openLocalRealm',
      },
      auth: {
        url: process.env.AUTH0_ISSUER_URL,
        audience: process.env.AUTH0_RESOURCE_SERVER,
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
      },
      instances: {
        public: process.env.REALM_PARTITION_KEY,
        organization: process.env.REALM_PARTITION_KEY_ORGANIZATION,
      },
    },
    default: process.env['DB_CONNECTION'] || 'realm',
  },
  rabbitmq: {
    uri: process.env.RABBITMQ_URL,
    exchange: process.env.RABBITMQ_EXCHANGE,
    exchangeType: process.env.RABBITMQ_EXCHANGE_TYPE || 'topic',
    queue: default_queue,
    routingKey: [`${default_queue}.*`, `${default_queue}.*.*`],
    errorsRoutingKey:
      process.env.RABBITMQ_ERRORS_ROUTING_KEY || 'mngm-crm-errors',
  },
  aws_s3: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_S3_BUCKET,
  },
  cache: {
    default: process.env['DEFAULT_CACHE'] || 'memory',
    ttl: parseInt(process.env.TTL_CACHE) || 0,
    redis: {
      url:
        `redis://${process.env.REDIS_HOST}:` +
          parseInt(process.env.REDIS_PORT) || 6379,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
    },
  },
};
