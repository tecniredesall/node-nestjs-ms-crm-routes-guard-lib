import { RealmRepository } from '@app/common/repositories/realm.repository';
import { IExample } from '../interfaces';
import { IRepository } from '../interfaces/repository';

export class ExampleRealmRepository
  extends RealmRepository<IExample>
  implements IRepository
{
  constructor() {
    super('Example', 'organization');
    //Here you establish to which instance you want to connect with a different configuration as a different partitionKey
    //Example: super('Example', 'public');
  }

  findAll() {
    return this.find();
  }
}
