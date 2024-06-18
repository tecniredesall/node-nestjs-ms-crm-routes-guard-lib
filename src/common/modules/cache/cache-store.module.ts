import configuration from '@app/config/configuration';
import { CacheModule, Global, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

const makeImports = () => {
  if (configuration.cache.default === 'redis') {
    return [
      CacheModule.register({
        store: redisStore,
        url: configuration.cache.redis.url,
        ttl: configuration.cache.ttl,
      }),
    ];
  } else {
    // use memory cache
    return [CacheModule.register({ ttl: configuration.cache.ttl })];
  }
};

@Global()
@Module({
  imports: [...makeImports(), CacheStoreModule],
  providers: [],
  controllers: [],
  exports: [CacheModule],
})
export class CacheStoreModule {}
