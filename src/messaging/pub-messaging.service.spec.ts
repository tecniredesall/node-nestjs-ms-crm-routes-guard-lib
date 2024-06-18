import { RabbitModule } from '@app/common/modules/rabbit/rabbit.module';
import { Test, TestingModule } from '@nestjs/testing';
import { PubMessagingService } from './pub-messaging.service';

describe('PubMessagingService', () => {
  let service: PubMessagingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RabbitModule],
      providers: [PubMessagingService],
    }).compile();

    service = module.get<PubMessagingService>(PubMessagingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
