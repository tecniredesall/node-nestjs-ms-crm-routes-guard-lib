import { PageDto, PageMetaDto } from '@app/common/dtos';
import { FilterPaginationQuery } from '@app/common/middleware/req-filterpaginate.middleware';
import { Test, TestingModule } from '@nestjs/testing';
import { RabbitModule } from '@app/common/modules/rabbit/rabbit.module';
import { S3Service } from '@app/aws/s3.service';

import { ExampleService } from './example.service';
import { ExampleMongoRepository } from './repositories/example.mongo.repository';
import { ExampleMemoryRepository } from './repositories/memory.repository';
import { PubMessagingService } from '@app/messaging/pub-messaging.service';
//import { PrismaService } from '@app/prisma/prisma.service';
import { OTPNotification } from '@app/notifications/example/otp.notification';

describe('ExampleService', () => {
  let service: ExampleService;
  let repository: ExampleMongoRepository;
  let filters: FilterPaginationQuery;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RabbitModule],

      providers: [
        PubMessagingService,
        OTPNotification,
        ExampleService,
        S3Service,
        {
          provide: ExampleMongoRepository,
          useClass: ExampleMemoryRepository,
        },
        //PrismaService,
      ],
    }).compile();

    service = module.get<ExampleService>(ExampleService);
    repository = module.get<ExampleMongoRepository>(ExampleMongoRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findPaginate', () => {
    beforeEach(() => {
      filters = new FilterPaginationQuery({
        mongoQueryString: '{}',
        sort: {},
        limit: 10,
        page: 1,
        fields: '',
      });

      jest.spyOn(ExampleMemoryRepository.prototype, 'paginate');
      jest.spyOn(ExampleMemoryRepository.prototype, 'count');

      jest.clearAllMocks();
    });

    it('should return an instance a PageDto', async () => {
      const result = await service.findPaginate(filters);

      expect(result).toBeInstanceOf(PageDto);
      expect(result._meta).toBeInstanceOf(PageMetaDto);
    });

    it('should call example repository', async () => {
      await service.findPaginate(filters);

      expect(repository.paginate).toHaveBeenCalledTimes(1);
      expect(repository.count).toHaveBeenCalledTimes(1);
      expect(repository.paginate).toHaveBeenCalledWith(filters);
      expect(repository.count).toHaveBeenCalledWith(filters);
    });
  });
});
