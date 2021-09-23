import { Test, TestingModule } from '@nestjs/testing';
import { Fm1Service } from './fm1.service';

describe('Fm1Service', () => {
  let service: Fm1Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Fm1Service],
    }).compile();

    service = module.get<Fm1Service>(Fm1Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
