import type { AgentBase } from './agent';
import type { AgentRequestContext } from './context';
import type { AgentTool } from './tool';
import { XMLParser } from 'fast-xml-parser';
import { md5 } from 'js-md5';

export class AgentTools {
  private _agent: AgentBase;

  get db() {
    return this._agent.service.db;
  }

  map: Record<string, AgentTool> = {};

  constructor(agent: AgentBase) {
    this._agent = agent;
  }

  addTool(tool: AgentTool) {
    this.map[tool.name] = tool;
    return this;
  }

  async resolveToolCallFromMessage(context: AgentRequestContext) {
    const message = context.messageRound;

    // 最后一轮调用，直接输出结果
    if (context.round >= this._agent.maxRound) {
      context.toolCalls.push({
        state: 'success',
        result: message,
        output: true,
      });
      return;
    }

    const reg = /<use-tool[^>]*>([\s\S]*?)<\/use-tool>/;
    const matchRes = message.match(reg);
    if (!matchRes) {
      // 不存在工具调用
      context.toolCalls.push({
        state: 'success',
        result: message,
        output: true,
      });
      return;
    }

    const [, toolUseXml = ''] = matchRes;

    try {
      const parser = new XMLParser();
      const data = parser.parse(toolUseXml);
      const [toolName = ''] = Object.keys(data);
      const tool = this.map[toolName];
      if (!tool) {
        context.toolCalls.push({
          name: toolName,
          state: 'failed',
          result: `找不到工具 ${toolName}`,
          output: false,
        });
        return;
      }

      const toolParams = data?.[toolName] || {};
      const res = await tool.execute(toolParams, context);
      context.toolCalls.push(res);
    }
    catch {
      context.toolCalls.push({
        state: 'failed',
        result: '工具调用 XML 解析失败',
        output: false,
      });
    }
  }

  async saveToolCallMemory(context: AgentRequestContext) {
    const toolName = context.lastCall.name || '';
    const sign = this.toSign(toolName, context.lastCall.params);
    const tool = this.map[toolName];
    if (!tool) {
      return;
    }

    if (!tool.memoryEnabled) {
      return;
    }

    await this.db.t_chatbot_memory.upsert({
      where: {
        sign_type_conversationId_messageId: {
          sign,
          type: 'toolcall',
          conversationId: context.conversationId,
          messageId: context.messageId,
        },
      },
      update: {
        content: context.messageRound,
        expiresAt: new Date(Date.now() + tool.memoryTtl * 60 * 1000),
      },
      create: {
        sign,
        type: 'toolcall',
        content: context.messageRound,
        expiresAt: new Date(Date.now() + tool.memoryTtl * 60 * 1000),
        conversationId: context.conversationId,
        messageId: context.messageId,
      },
    });
  }

  toSign(toolName: string, params: Record<string, any> = {}) {
    return md5(`${toolName}:${JSON.stringify(params)}`);
  }

  toPrompt(additionPrompt: string = '') {
    const toolsPrompt = Object.values(this.map).map(tool => tool.toPrompt()).join('\n');

    return `<tool-use-rules>

# 工具使用

每条消息中你可以使用一个工具，并且会在用户的回复中收到该工具使用的结果。你会逐步使用工具来完成给定的任务，每次使用工具都以前一次工具使用的结果为依据。

## 工具使用格式

工具使用采用XML风格的标签进行格式化。工具名称包含在开始标签和结束标签中，每个参数也同样包含在其自身的一组标签中。结构如下：

<use-tool label="label">
<tool-name>
<parameter1-name>value1</parameter1-name>
<parameter2-name>value2</parameter2-name>
...
</tool-name>
</use-tool>


始终遵循此工具使用格式，以确保正确的解析和执行。

生成 XML 输出的要求：
- 你必须严格按照下面的 XML 格式返回你的分析结果
- 输出的 XML **禁止**包含任何额外的解释或文本
- **禁止**将 XML 包裹在 markdown 代码块中（不要使用\`\`\`或\`\`\`xml）

举例如下(使用 \`get-project-info-by-id\` 工具)：

<use-tool label="获取内源项目详情">
<get-project-info-by-id>
<project-id>2</project-id>
</get-project-info-by-id>
</use-tool>

## 工具结果格式

当工具调用获得结果后，将在原先的工具使用 XML 基础上增加 \`<result>\` 部分展示结果，结构如下：

<use-tool label="label">
<tool-name>
<parameter1-name>value1</parameter1-name>
<parameter2-name>value2</parameter2-name>
...
</tool-name>
</use-tool>

## 工具列表

${toolsPrompt}

## 工具使用指南

0. 禁止使用工具列表中未列出的工具。
1. 在工具调用 XML 之前，评估你已掌握的信息以及完成任务所需的信息。
2. 根据任务和所提供的工具描述，选择最合适的工具。评估是否需要额外信息来推进任务，以及哪些可用工具最适合收集这些信息。
3. 如果需要执行多个操作，每条消息中一次使用一个工具，以迭代方式完成任务，每次使用工具都要以之前工具的使用结果为依据。不要假设任何工具使用的结果。每一步都必须基于上一步的结果。
4. 使用每个工具指定的XML格式来构建你的工具使用指令。
5. 每次使用工具后，用户会回复该工具的使用结果。这个结果会为你提供继续任务或做出进一步决策所需的信息。回复可能包括：
  - 关于工具是否成功的信息，以及失败的原因（如有）。
  - 任何其他与工具使用相关的反馈或信息。
6. **每次使用工具后，务必等待用户确认再继续操作**。在没有用户明确确认结果的情况下，绝不要假设工具使用成功。

逐步推进任务至关重要，每次使用工具后都要等待用户的消息，然后再继续下一步。这种方法能让你：

1. 在继续之前确认每一步的成功。
2. 立即处理出现的任何问题或错误。
3. 根据新信息或意外结果调整你的方法。
4. 确保每个操作都能在之前的操作基础上正确进行。

通过等待并仔细考虑用户在每次工具使用后的回复，你可以做出相应的反应，并就如何推进任务做出明智的决策。这种迭代过程有助于确保你的工作总体上是成功且准确的。

${additionPrompt}

</tool-use-rules>
`;
  }
}
