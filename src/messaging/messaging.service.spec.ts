import { RabbitModule } from '@app/common/modules/rabbit/rabbit.module';
import { Test, TestingModule } from '@nestjs/testing';
import { MessagingService } from './messaging.service';
import { PubMessagingService } from './pub-messaging.service';

describe('MessagingService', () => {
  let service: MessagingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RabbitModule],
      providers: [MessagingService, PubMessagingService],
    }).compile();

    service = module.get<MessagingService>(MessagingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
