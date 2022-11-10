import { Test, TestingModule } from '@nestjs/testing';
import { DooraController } from './doora.controller';

describe('DooraController', () => {
  let controller: DooraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DooraController],
    }).compile();

    controller = module.get<DooraController>(DooraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
