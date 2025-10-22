import type { Response } from 'express';
import type {
  BaseChatDto,
  FeedbacksDto,
  HistoryDto,
  RenameDto,
  UserDto,
} from './dto';
import type { AgentBase } from './modules';
import {
  BadRequestException,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from '../prisma.service';
import {
  AgentAutoName,
  AgentChat,
  AgentGetKnowledge,
  AgentSuggest,
  AgentW3Search,
} from './apps';
import { AgentRequestContext } from './modules/context';

@Injectable()
export class AgentService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  readonly logger!: LoggerService;

  @Inject(PrismaService)
  readonly db!: PrismaService;

  /** 对话 Map，通过对话 id 检索到请求连接对象与中断控制器，用于控制请求的中止 */
  messageControllerMap = new Map<string, AgentRequestContext>();

  private async _getAgent(body: BaseChatDto) {
    const {
      name,
      conversation_id = '',
      user,
    } = body;

    // 检查会话状态与用户权限
    if (conversation_id) {
      const res = await this.db.t_chatbot_conversation.findUniqueOrThrow({
        select: { userId: true, status: true },
        where: { id: conversation_id },
      });

      if (res.status === 'buzy') {
        throw new BadRequestException(`当前会话存在进行中的对话，请稍后再试！`);
      }

      if (res.status === 'disabled') {
        throw new BadRequestException(`当前会话已被删除，无法继续对话！`);
      }

      if (user !== res.userId) {
        throw new BadRequestException('当前用户不具有会话权限！');
      }
    }

    let agent: AgentBase;
    if (name === AgentChat.agentName) {
      agent = new AgentChat(this);
    }
    else if (name === AgentW3Search.agentName) {
      agent = new AgentW3Search(this);
    }
    else if (name === AgentGetKnowledge.agentName) {
      agent = new AgentGetKnowledge(this);
    }
    else if (name === AgentAutoName.agentName) {
      agent = new AgentAutoName(this);
    }
    else if (name === AgentSuggest.agentName) {
      agent = new AgentSuggest(this);
    }
    else {
      throw new BadRequestException(`找不到名称为 ${name} 的 Agent！`);
    }

    await agent.init(body.model);
    return agent;
  }

  async blockRequest(body: BaseChatDto, parentContext?: AgentRequestContext) {
    const agent = await this._getAgent(body);
    const context = new AgentRequestContext(agent, body);
    parentContext?.registerSubContext(context);
    await agent.blockRequest(context);
    return context;
  }

  async streamRequest(body: BaseChatDto, res: Response) {
    const agent = await this._getAgent(body);
    const context = new AgentRequestContext(agent, body, res);
    agent.streamRequest(context);
    return context;
  }

  private async _checkMessageId(messageId: string, user: string) {
    const { conversation } = await this.db.t_chatbot_message.findUniqueOrThrow({
      select: {
        conversation: {
          select: { userId: true },
        },
      },
      where: { id: messageId },
    });

    if (user !== conversation.userId) {
      throw new BadRequestException('当前用户不具有会话权限！');
    }
  }

  private async _checkConversationId(conversationId: string, user: string) {
    const { userId } = await this.db.t_chatbot_conversation.findUniqueOrThrow({
      where: { id: conversationId },
      select: { userId: true },
    });

    if (user !== userId) {
      throw new BadRequestException('当前用户不具有会话权限！');
    }
  }

  async stopRequest(messageId: string, user: string) {
    await this._checkMessageId(messageId, user);

    const context = this.messageControllerMap.get(messageId);
    if (!context) {
      throw new BadRequestException('停止失败，该请求已经不存在');
    }

    await context.stopRequest();
  }

  /** 删除会话 */
  async deleteConversation(id: string, user: string) {
    return await this.db.t_chatbot_conversation.update({
      data: { status: 'disabled' },
      where: { id, userId: user },
    });
  }

  /** 查询历史会话 */
  async getConversationHistoryMessages(dto: HistoryDto) {
    const {
      conversation_id,
      first_id,
      limit = 20,
      user,
    } = dto;

    // 先获取 first_id 的消息（如果有），用 createdAt 分页
    let createdBefore: Date | undefined;
    if (first_id) {
      const firstMsg = await this.db.t_chatbot_message.findUniqueOrThrow({
        where: { id: first_id },
        select: { createdAt: true },
      });
      createdBefore = firstMsg.createdAt;
    }

    // 查询条件
    const where: any = {
      conversationId: conversation_id,
    };
    if (createdBefore) {
      where.createdAt = { lt: createdBefore };
    }

    // 查询消息
    const messages = await this.db.t_chatbot_message.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        feedbacks: {
          select: { rating: true },
          where: { userId: user },
        },
      },
    });

    return {
      data: messages.map(m => ({
        id: m.id,
        conversation_id: m.conversationId,
        inputs: m.inputs,
        query: m.query,
        answer: `${m.processContent}\n${m.answer}`,
        create_at: m.createdAt,
        feedback: m.feedbacks.length > 0 ?
            {
              rating: m.feedbacks?.[0]?.rating,
            } :
          null,
      })),
      has_more: messages.length === limit,
      limit,
    };
  };

  async renameConversation(conversationId: string, dto: RenameDto) {
    const {
      name = '',
      auto_generate = false,
      user,
    } = dto;

    await this._checkConversationId(conversationId, user);

    if (!auto_generate) {
      await this.db.t_chatbot_conversation.update({
        where: { id: conversationId },
        data: { title: name },
      });

      return {
        id: conversationId,
        name,
      };
    }

    // 获取第一条消息的用户提问部分
    const { query } = await this.db.t_chatbot_message.findFirstOrThrow({
      select: { query: true },
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    // 调用重命名 Agent 获取标题
    const context = await this.blockRequest({
      name: 'auto-name',
      user,
      title: '系统：对话命名',
      query,
      response_mode: 'blocking',
      type: 'sub',
    });

    // 更新标题
    await this.db.t_chatbot_conversation.update({
      where: { id: conversationId },
      data: { title: context.finalResult },
    });

    return {
      id: conversationId,
      name: context.finalResult,
    };
  }

  async getSuggestedQuestions(messageId: string, dto: UserDto) {
    const { user } = dto;

    await this._checkMessageId(messageId, user);

    const { query, processContent, answer } = await this.db.t_chatbot_message.findUniqueOrThrow({
      select: {
        query: true,
        processContent: true,
        answer: true,
      },
      where: { id: messageId },
    });

    // 调用生成问题 Agent 获取问题
    const context = await this.blockRequest({
      name: 'suggest',
      user,
      query: '',
      title: '系统：生成问题',
      inputs: {
        user: query,
        assistant: `${processContent}\n${answer}`,
      },
      response_mode: 'blocking',
      type: 'sub',
    });

    try {
      const data = JSON.parse(context.finalResult.trim());
      return data;
    }
    catch {
      throw new BadRequestException('生成问题文本解析错误');
    }
  }

  async feedbackMessage(messageId: string, dto: FeedbacksDto) {
    const {
      user,
      content,
      rating,
    } = dto;

    if (!rating) {
      // 取消点赞/点踩
      await this.db.t_chatbot_feedback.delete({
        where: {
          messageId_userId: {
            messageId,
            userId: user,
          },
        },
      });
      return;
    }

    await this.db.t_chatbot_feedback.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId: user,
        },
      },
      create: {
        messageId,
        rating,
        content,
        userId: user,
      },
      update: {
        rating,
        content,
      },
    });
  }
}
