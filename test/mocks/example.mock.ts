// import { Types } from 'mongoose';
import {
  CreateExampleDto,
  NamesDto,
} from '@app/example/dto/create-example.dto';
import { faker } from '@faker-js/faker';

function createMockNames(): NamesDto[] {
  const languages = ['en', 'es', 'pt_BR'];
  return languages.map((language) => {
    faker.setLocale(language);
    return {
      // _id throws error if sent as string when creating in Realm
      // _id: new Types.ObjectId().toString() as unknown as Types.ObjectId,
      description: faker.commerce.productDescription(),
      value: faker.commerce.productName(),
      language,
    } as NamesDto;
  });
}

export function createMockExample() {
  const mock: CreateExampleDto = {
    slug: faker.commerce.productName().replace(/\s/g, '_').toLowerCase(),
    names: createMockNames(),
  };
  return mock;
}
