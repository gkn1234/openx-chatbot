import type { Response } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import {
  BaseChatDto,
  FeedbacksDto,
  HistoryDto,
  RenameDto,
  UserDto,
} from './dto';

@Controller('agent')
export class AgentController {
  constructor(private agentService: AgentService) {}

  /** 启动对话 */
  @Post('/chat-messages')
  @UsePipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }))
  async chatMessages(@Body() body: BaseChatDto, @Res() res: Response) {
    if (body.response_mode === 'blocking') {
      const result = await this.agentService.blockRequest(body);
      return res.json(result);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 获取多轮对话的流式响应
    await this.agentService.streamRequest(body, res);
  }

  /** 停止对话 */
  @Post('/chat-messages/:task_id/stop')
  @UsePipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }))
  async stopChatMessages(
    @Param('task_id') taskId: string,
    @Body() dto: UserDto,
  ) {
    await this.agentService.stopRequest(taskId, dto.user);
    return { result: 'success' };
  }

  /** 删除会话 */
  @Delete('/conversations/:conversation_id')
  @UsePipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }))
  async deleteConversation(
    @Param('conversation_id') conversationId: string,
    @Body() dto: UserDto,
  ) {
    return await this.agentService.deleteConversation(conversationId, dto.user);
  }

  /** 会话重命名 */
  @Post('/conversations/:conversation_id/name')
  @UsePipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }))
  async renameConversation(
    @Param('conversation_id') conversationId: string,
    @Body() dto: RenameDto,
  ) {
    return this.agentService.renameConversation(conversationId, dto);
  }

  /** 获取会话的历史消息 */
  @Get('/messages')
  @UsePipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }))
  async getConversationHistoryMessages(@Query() dto: HistoryDto) {
    return await this.agentService.getConversationHistoryMessages(dto);
  }

  /** 获取下一轮建议列表 */
  @Get('/messages/:message_id/suggested')
  @UsePipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }))
  async getSuggested(
    @Param('message_id') messageId: string,
    @Query() dto: UserDto,
  ) {
    const questions = await this.agentService.getSuggestedQuestions(messageId, dto);
    return {
      result: 'success',
      data: questions,
    };
  }

  /** 消息反馈 */
  @Post('/messages/:message_id/feedbacks')
  @UsePipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }))
  async feedbackMessage(
    @Param('message_id') messageId: string,
    @Body() dto: FeedbacksDto,
  ) {
    await this.agentService.feedbackMessage(messageId, dto);
    return { result: 'success' };
  }
}
