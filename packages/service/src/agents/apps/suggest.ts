import type { AgentService } from '../agent.service';
import type { AgentRequestContext } from '../modules';
import { AgentBase } from '../modules';

export class AgentSuggest extends AgentBase {
  /** @override */
  static agentName = 'suggest';

  constructor(service: AgentService) {
    super(service);
  }

  /** @override */
  protected async processSystemPrompt(context: AgentRequestContext) {
    context.checkStop();

    context.system = `<role>
你现在是一个智能问答助手。在用户与系统进行一轮对话后，请基于本轮对话内容，推测用户可能感兴趣的其他问题。

请生成 3 个相关问题，每个问题应简洁明了，紧扣用户当前话题或潜在需求。
</role>

<output-rules>
输出要求如下：
- 你必须严格按照下面的 JSON 列表格式返回你的分析结果
- 输出内容除了 JSON 之外，**禁止**包含任何额外的解释或文本
- **禁止**将 JSON 包裹在 markdown 代码块中（不要使用\`\`\`或\`\`\`json）
</output-rules>

<output-example>

["问题 1", "问题 2", "问题 3"]

</output-example>`;
  }

  /** @override */
  protected async processUserPrompt(context: AgentRequestContext) {
    context.checkStop();

    context.user = `对话内容如下：
<user>
${context.inputs.user}
</user>

<assistant>
${context.inputs.assistant}
</assistant>`;
  };
}
