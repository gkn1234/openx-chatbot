import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
} from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import {
  GetBelongingDataDto,
  SearchDetailDto,
  TransformDto,
} from './dto';

@ApiTags('问答助手')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get('belonging')
  @UsePipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }))
  getBelongingData(@Query() dto: GetBelongingDataDto) {
    return this.chatbotService.getBelongingData(dto);
  }

  @Get('search')
  search(
    @Query('query') query: string,
    @Query('turn') turn: string,
    @Query('maxLength') maxLength: string,
  ) {
    turn = turn || '1';
    maxLength = maxLength || '300';
    return this.chatbotService.search(query, Number(turn), Number(maxLength));
  }

  @Post('search-detail')
  @UsePipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }))
  async searchDetail(@Body() dto: SearchDetailDto) {
    const promises: Promise<void>[] = [];
    if (!Array.isArray(dto.list)) {
      dto.list = [];
    }
    dto.list.forEach((item) => {
      promises.push(this.chatbotService.getSearchDetail(item));
    });
    await Promise.all(promises);

    const res: SearchDetailDto = { list: [] };
    const maxLength = dto.maxLength || 78000;
    let length = 0;
    for (let i = 0; i < dto.list.length && length < maxLength; i++) {
      const item = dto.list[i];
      length += item.content.length;

      if (length < maxLength) {
        res.list.push(item);
      }
      else {
        const restLength = maxLength - length + item.content.length;
        item.content = item.content.slice(0, restLength);
        res.list.push(item);
      }
    }

    return res;
  }

  @Post('transform')
  @UsePipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }))
  async transform(@Body() dto: TransformDto) {
    const res = await this.chatbotService.transform(dto);
    return { data: res };
  }
}
