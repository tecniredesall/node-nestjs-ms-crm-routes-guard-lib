import UserDto from '../../auth0/dto/user.dto';
import { PERMITS_KEY } from '../decorators/permits.decorator';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permit } from '../schemas/permits.enum';
import { UserSchema } from '../../user/schemas/user.schema.mongo';
import { PermitsSchema } from '../../permits/schemas/permits.schema.mongo';
import { ProfileSchema } from '../../profile/schemas/profile.schema.mongo';
import { RolesSchema } from '../../roles/schemas/roles.schema.mongo';
import { createConnection } from 'mongoose';

const con = createConnection(`${process.env['MONGO_USER_CONNECTION']}`);
const User = con.model('user', UserSchema, 'user');
const Permits = con.model('permits', PermitsSchema, 'permits');
const Profile = con.model('profile', ProfileSchema, 'profile');
const Roles = con.model('roles', RolesSchema, 'roles');

@Injectable()
export class PermitsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const requiredPermits = this.reflector.getAllAndOverride<Permit[]>(
      PERMITS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermits) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = <UserDto>request.user;
    const auth0 = user.getAuthId();
    const filter = {
      'externals.platform_id': { $regex: `.*${auth0}` },
    };

    /**
     * If user is member of more than one organization, provide bt-organization to get the correct user permissions
     */
    if (request.headers?.['bt-organization']) {
      const organization = request.headers?.['bt-organization'];
      filter['_partitionKey'] = { $regex: `.*${organization}` };
    }
    const user_related = await User.find(filter);

    //TODO: this is an improvement for the future when we have a crear wey of leading with several links
    const mappedUser: any = user_related[0].link[0];
    const profiles_id = mappedUser?.profiles?.map((item) => item.id) || [];
    const roles_id = mappedUser?.roles?.map((item) => item.id) || [];
    const permissions_ids =
      mappedUser?.permissions?.map((item) => item.id) || [];

    if (profiles_id.length) {
      const profiles: any = await Profile.find({ _id: { $in: profiles_id } });

      profiles.forEach((profile) => {
        roles_id.push(...profile.roles.map((role) => role.id));
        permissions_ids.push(
          ...profile.permissions.map((permission) => permission.id),
        );
      });
    }

    if (roles_id.length) {
      const roles: any = await Roles.find({
        _id: { $in: roles_id },
      });

      roles.forEach((role) => {
        permissions_ids.push(
          ...role.permissions.map((permission: any) => permission.id),
        );
      });
    }

    const slugs = [];

    if (permissions_ids.length) {
      const permissions_related = await Permits.find({
        _id: { $in: permissions_ids },
      });

      for (const position in permissions_related) {
        slugs.push(permissions_related[position].slug);
      }
    }

    return requiredPermits.some((permit) => slugs.includes(permit));
  }
}
