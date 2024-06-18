import * as Realm from 'realm';
import { App, User } from 'realm';

import { IRealmConfig } from './../common/interfaces/Realm.interface';

export class RealmConnection {
  public app: App;
  protected realm: Realm;
  public user: User;
  public schemas: any = [];

  constructor(schemas?: any[]) {
    if (schemas) this.schemas = schemas;
  }

  async register(options: IRealmConfig) {
    this.app = new Realm.App({
      id: options.appId,
    });
    const credentials = Realm.Credentials.jwt(options.authToken);
    await this.logIn(credentials);
    await this.open(options);
  }

  public setSchemas(schemas: any) {
    if (schemas && schemas.length > 0) {
      this.schemas = schemas;
    }
  }

  async open(options: IRealmConfig) {
    const configRealm: any = {
      schema: this.schemas,
      sync: {
        user: this.app.currentUser,
        partitionValue: options.partitionKey,
        existingRealmFileBehavior: options.behavior,
      },
    };
    try {
      this.realm = await Realm.open(configRealm);
      console.log('Successfully connection!', this.realm);
    } catch (err) {
      console.error('Failed to connection realm', err.message);
    }
  }

  public async write(callback: any) {
    this.realm.write(() => {
      return new Promise((resolve) => {
        resolve(callback);
      });
    });
  }

  public async logIn(credentials: Realm.Credentials) {
    try {
      this.user = await this.app.logIn(credentials);
      console.log('Successfully logged in!', this.user.id);
      return Promise.resolve(this.user);
    } catch (err) {
      console.error('Failed to log in', err.message);
      return Promise.reject('Failed to log in' + err.message);
    }
  }

  public closeConnection() {
    if (this.realm) this.realm.close();
  }

  public getConnection(): Realm {
    return this.realm;
  }
}
