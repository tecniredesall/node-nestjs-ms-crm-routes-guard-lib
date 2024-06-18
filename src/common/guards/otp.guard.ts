import UserDto from '@app/auth0/dto/user.dto';
import { CacheService } from '@app/cache/cache.service';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  RequestTimeoutException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
@Injectable()
export class OTPGuard implements CanActivate {
  constructor(private reflector: Reflector, private cache: CacheService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = <UserDto>request.user;
    const signature = request?.headers?.signature;
    if (!signature) throw new UnauthorizedException('Signature Required');
    const token = await this.cache.get(signature);
    if (!token)
      throw new RequestTimeoutException(
        'Your code has been expired, require new code.',
      );
    if (token?.user_id != user?.getAuthId())
      throw new UnauthorizedException(
        'The user is not the one who signed the code',
      );
    await this.cache.delete(signature);
    return true;
  }
}
