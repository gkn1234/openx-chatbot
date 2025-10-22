import type { AgentService } from '../agent.service';
import type { AgentRequestContext } from '../modules';
import type { W3SearchDetailItem } from '../tools/w3-search';
import { AgentBase } from '../modules';

export class AgentW3Search extends AgentBase {
  /** @override */
  static agentName = 'w3-search';

  constructor(service: AgentService) {
    super(service);
  }

  /** @override */
  protected async processSystemPrompt(context: AgentRequestContext) {
    context.checkStop();

    context.system = `<role>
你是一个搜索结果分析大师，擅长阅读理解、信息筛选、信息总结。
</role>

<todo>
你会获得以下输入信息：
- 若干条搜索结果，格式参考下面 \`<search-result-example>\` 的 XML 格式
- 用户对话信息

你的任务：
- 首先从用户对话信息中分析出[用户当前关注主题]
- 判断每条搜索结果与[用户当前关注主题]是否相关，排除所有不相关的搜索结果
- 对于相关的搜索结果，将详细内容部分**与[用户当前关注主题]相关**的内容提取出来，作为新的详细内容
- 提取改写的过程中，请保持原有信息的完整性和准确性
- 以 XML 的形式输出最终结果
</todo>

<output-rules>
生成 XML 输出的要求：
- 你必须严格按照下面的 XML 格式返回你的分析结果
- 输出的 XML **禁止**包含任何额外的解释或文本
- **禁止**将 XML 包裹在 markdown 代码块中（不要使用\`\`\`或\`\`\`xml）
</output-rules>

<search-result-example>

${this._w3SearchXmlPrompt([
  {
    title: '欢迎体验内源 AI 问答助手',
    url: 'https://openx.huawei.com/OpenX/dynamics/15128?source=w3',
    content: '[详细内容]',
  },
  {
    title: '邀请所有内源项目Owner，管理自己的知识库，以便AI准确回答用户问题。',
    url: 'https://openx.huawei.com/activityZone/activityDetail?activityId=1885&source=w3',
    content: '[详细内容]',
  },
])}

</search-result-example>

<xml-generate-checklist>
生成XML前，必须执行3步自我校验，确认无误后再输出：
- 标签校验：数清 <search-result> 的数量与 </search-result> 的数量是否完全一致，无多漏；
- 引号校验：检查 title、url 两个属性的双引号，是否每个都“开头有"、结尾有"”，无半开状态；
- 符号校验：检查所有标签是否为 <search-result ...>（开头）、</search-result>（结尾），无 <search-result> 后漏“>”、闭合标签漏“/”等情况。
</xml-generate-checklist>
`;
  }

  /** @override */
  protected async processUserPrompt(context: AgentRequestContext) {
    context.checkStop();

    let messagePrompt = '';
    const { parentContext } = context;
    if (parentContext) {
      messagePrompt = await parentContext.agent.utils.toHistoryMessagePrompt(
        parentContext.conversationId,
        parentContext.messageCreateTime,
      );
    }
    messagePrompt += `\n<user>\n${context.query}\n</user>`;

    context.user = `<input>

原始搜索结果如下：

${this._w3SearchXmlPrompt(context.inputs.rawKnowledgeResult)}

用户对话信息如下：

${messagePrompt}

</input>`;
  };

  private _w3SearchXmlPrompt(searchResult: W3SearchDetailItem[]) {
    return searchResult.map(
      res => `<search-result title="${res.title}" url="${res.url}">\n${res.content}\n</search-result>`,
    ).join('\n');
  }
}
