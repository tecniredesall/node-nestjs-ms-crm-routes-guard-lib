export default class UserDto {
  readonly roles: string[];
  readonly familyName: string;
  readonly nickname: string;
  readonly name: string;
  readonly picture: string;
  readonly updatedAt: string;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly iss: string;
  readonly sub: string;
  readonly aud: string;
  readonly iat: number;
  readonly exp: number;

  constructor(payload: any) {
    this.familyName = payload.family_name;
    this.nickname = payload.nickname;
    this.name = payload.name;
    this.picture = payload.picture;
    this.updatedAt = payload.updated_at;
    this.email = payload.email;
    this.emailVerified = payload.email_verified;
    this.iss = payload.iss;
    this.sub = payload.sub;
    this.aud = payload.aud;
    this.iat = payload.iat;
    this.exp = payload.exp;
    this.roles = payload['http://www.grainchain.io/roles'];
  }

  hasRole(role: string): boolean {
    let isHasRole = false;
    this.roles?.forEach((r) => {
      if (r == role) {
        isHasRole = true;
      }
    });
    return isHasRole;
  }
  getAuthId() {
    if (this.sub !== undefined) {
      return this.sub.split('|')[1];
    }
    return undefined;
  }
}
