import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const appService = {
    getHealth: jest.fn(),
  };

  beforeEach(async () => {
    appService.getHealth.mockReset();
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('returns healthy status when MongoDB is connected', () => {
      const health = { status: 'ok', database: 'connected' } as const;
      appService.getHealth.mockReturnValue(health);

      expect(appController.getHealth()).toEqual(health);
    });

    it('returns service unavailable when MongoDB is disconnected', () => {
      appService.getHealth.mockReturnValue({
        status: 'error',
        database: 'disconnected',
      });

      expect(() => appController.getHealth()).toThrow(
        'Service Unavailable',
      );
    });
  });
});
