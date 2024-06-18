import { MemoryRepository } from '@app/common/repositories/memory.repository';
import { IRepository } from '../interfaces/repository';

export class ExampleMemoryRepository
  extends MemoryRepository
  implements IRepository
{
  findAll() {
    return this.find();
  }
}
