import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ChatbotService } from './chatbot.service';

describe('chatbotService', () => {
  let service: ChatbotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatbotService],
    }).compile();

    service = module.get<ChatbotService>(ChatbotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
