import { Test, TestingModule } from '@nestjs/testing';
import { Fm1Controller } from './fm1.controller';

describe('Fm1Controller', () => {
  let controller: Fm1Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Fm1Controller],
    }).compile();

    controller = module.get<Fm1Controller>(Fm1Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
