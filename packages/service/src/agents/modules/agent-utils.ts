import type { AgentBase } from './agent';

export class AgentUtils<T extends AgentBase = AgentBase> {
  private _agent: T;

  get db() {
    return this._agent.service.db;
  }

  constructor(agent: T) {
    this._agent = agent;
  }

  async toHistoryMessagePrompt(
    conversationId: string,
    timeBefore: Date,
  ) {
    const historyMessages = await this.db.t_chatbot_message.findMany({
      select: {
        query: true,
        answer: true,
      },
      where: {
        conversationId: { equals: conversationId },
        createdAt: { lt: timeBefore },
      },
      orderBy: [
        { createdAt: 'asc' },
      ],
    });

    return historyMessages.map(msg => (`<user>\n${msg.query}\n</user>\n<assistant>\n${msg.answer}\n</assistant>`)).join('\n');
  }
}
