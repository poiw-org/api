import { Test, TestingModule } from '@nestjs/testing';
import { DooraService } from './doora.service';

describe('DooraService', () => {
  let service: DooraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DooraService],
    }).compile();

    service = module.get<DooraService>(DooraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
