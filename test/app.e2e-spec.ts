import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { AppModule } from './../src/app.module';
import configuration from '@app/config/configuration';
import { createMockExample } from './mocks/example.mock';

if (!configuration.databases.realm.authToken)
  throw Error('REALM_AUTH0_TOKEN must be defined in the environment variables');

describe('AppController (e2e)', () => {
  let moduleFixture: TestingModule;
  let app: INestApplication;
  let amqpConnection: AmqpConnection;
  let dbConnection: Connection;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    amqpConnection = moduleFixture.get<AmqpConnection>(AmqpConnection);
    if (configuration.databases.default === 'mongo') {
      dbConnection = await moduleFixture.get(getConnectionToken());
    }
  });

  it('returns 200 OK', () => {
    return request(app.getHttpServer())
      .get('/example')
      .expect(({ body }) => {
        expect(body.data).toBeDefined();
      })
      .expect(200);
  });

  it('creates a new Example', async () => {
    const token = 'Bearer ' + configuration.databases.realm.authToken;
    const mock = {
      ...createMockExample(),
      _partitionKey: 'organization_id=e070c3d03a80387d1112a479',
    };
    return request(app.getHttpServer())
      .post('/example')
      .set({
        Authorization: token,
      })
      .send(mock)
      .expect(201)
      .expect(({ body }) => {
        expect(body.data).toBeDefined();
        expect(body.data._id).toBeDefined();
      })
      .catch((err) => {
        throw err;
      });
  });

  it('Retrieves an Example by id', async () => {
    const token = 'Bearer ' + configuration.databases.realm.authToken;
    const mock = {
      ...createMockExample(),
      _partitionKey: 'organization_id=e070c3d03a80387d1112a479',
    };
    const id = (
      await request(app.getHttpServer())
        .post('/example')
        .set({
          Authorization: token,
        })
        .send(mock)
    ).body.data._id;

    return request(app.getHttpServer())
      .get(`/example/${id}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toBeDefined();
        for (const mockKey in mock) {
          if (mockKey === 'names') {
            for (let i = 0; i < mock[mockKey].length; i++) {
              for (const nameKey in mock[mockKey][i]) {
                expect(body.data[mockKey][i][nameKey]).toEqual(
                  mock[mockKey][i][nameKey],
                );
              }
            }
          } else {
            expect(body.data[mockKey]).toEqual(mock[mockKey]);
          }
        }
      });
  });

  it('Retrieves an Example by query', async () => {
    const token = 'Bearer ' + configuration.databases.realm.authToken;
    const mock = {
      ...createMockExample(),
      _partitionKey: 'organization_id=e070c3d03a80387d1112a479',
    };
    await request(app.getHttpServer())
      .post('/example')
      .set({
        Authorization: token,
      })
      .send(mock);

    const query = JSON.stringify({
      slug: mock.slug,
    });
    return request(app.getHttpServer())
      .get(`/example/query?filter=${query}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toBeInstanceOf(Array);
        expect(body.data.length).toBeGreaterThan(0);
        const foundExample = body.data[0];
        for (const mockKey in mock) {
          if (mockKey === 'names') {
            for (let i = 0; i < mock[mockKey].length; i++) {
              for (const nameKey in mock[mockKey][i]) {
                expect(foundExample[mockKey][i][nameKey]).toEqual(
                  mock[mockKey][i][nameKey],
                );
              }
            }
          } else {
            expect(foundExample[mockKey]).toEqual(mock[mockKey]);
          }
        }
      });
  });

  it('Updates an existing Example', async () => {
    const token = 'Bearer ' + configuration.databases.realm.authToken;
    const mock = {
      ...createMockExample(),
      _partitionKey: 'organization_id=e070c3d03a80387d1112a479',
    };
    const updatedSlugValue = createMockExample().slug;
    const id = (
      await request(app.getHttpServer())
        .post('/example')
        .set({
          Authorization: token,
        })
        .send(mock)
    ).body.data._id;

    return request(app.getHttpServer())
      .put(`/example/${id}`)
      .send({
        ...mock,
        slug: updatedSlugValue,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(mock.slug === body.data.slug).toBeFalsy();
        expect(body.data.slug).toEqual(updatedSlugValue);
      });
  });

  it('Deletes an Example', async () => {
    const token = 'Bearer ' + configuration.databases.realm.authToken;
    const mock = {
      ...createMockExample(),
      _partitionKey: 'organization_id=e070c3d03a80387d1112a479',
    };
    const id = (
      await request(app.getHttpServer())
        .post('/example')
        .set({
          Authorization: token,
        })
        .send(mock)
    ).body.data._id;

    await request(app.getHttpServer()).delete(`/example/${id}`).expect(200);

    return request(app.getHttpServer()).get(`/example/${id}`).expect(404);
  });

  afterAll(async () => {
    await dbConnection?.close();
    await amqpConnection.managedChannel.close();
    await app.close();
    await moduleFixture.close();
  });
});
