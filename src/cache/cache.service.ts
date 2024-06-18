import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}
  public async set(key, value, ttl = 300) {
    try {
      await this.cache.set(key, value, { ttl: ttl });
    } catch (error) {
      console.log(error);
    }
  }

  public async get(key) {
    let result = null;
    try {
      result = await this.cache.get(key);
    } catch (error) {}
    return this.isJSON(result) ? JSON.parse(result) : result;
  }
  public async delete(key) {
    try {
      await this.cache.del(key);
    } catch (error) {}
    return Promise.resolve(true);
  }
  public isJSON(str: string) {
    try {
      return JSON.parse(str) && !!str;
    } catch (e) {
      return false;
    }
  }
}
