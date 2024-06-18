import { RealmConnection } from './realm.connection';
import configuration from '../config/configuration';
import fetch from 'node-fetch';

import { TaskSchemas } from './../example/interfaces/tasks.realm';
import { Example } from './../example/schemas/example.schema.realm';

export interface AuthResponse {
  access_token: string;
  scope: string;
  expires_in: number;
  token_type: string;
}

export class RealmManager {
  private static _instance: RealmManager;
  private connections = {
    public: {
      partitionKey: configuration.databases.realm.instances.public,
      connection: null,
      schemas: [],
    },
    organization: {
      partitionKey: configuration.databases.realm.instances.organization,
      connection: null,
      schemas: [...Example.getSchema(), ...TaskSchemas],
    },
  };
  private auth_url = `${configuration.databases.realm.auth.url}oauth/token`;
  private auth_options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      audience: configuration.databases.realm.auth.audience,
      grant_type: 'client_credentials',
      client_id: configuration.databases.realm.auth.client_id,
      client_secret: configuration.databases.realm.auth.client_secret,
    }),
    json: true,
  };

  private constructor() {
    //Don't delete the constructor since the class is a singleton
  }

  public async setConnection(identities: string[]) {
    try {
      let token = configuration.databases.realm.authToken;
      if (configuration.environment === 'prod') {
        const response = await fetch(this.auth_url, this.auth_options);

        if (!response.ok) {
          throw new Error(`Error! status: ${response.status}`);
        }

        const result = (await response.json()) as AuthResponse;

        token = result.access_token;
      }

      for await (const identity of identities) {
        const conf = configuration.databases.realm;
        conf.partitionKey = this.connections[identity]['partitionKey'];
        conf.authToken = token;
        const realmConnection = new RealmConnection(
          this.connections[identity]['schemas'],
        );
        await realmConnection.register(conf);
        this.connections[identity]['connection'] = realmConnection;
      }
    } catch (e) {
      console.error(`Error in realm manager `, e);
    }
  }

  public getInstance(identity: string): RealmConnection {
    try {
      return this.connections[identity]['connection'];
    } catch (e) {
      console.error(`Error in realm manager `, e);
      return null;
    }
  }

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }
}
