import type { AgentService } from '../agent.service';
import type { AgentRequestContext } from '../modules';
import { AgentBase } from '../modules';

export class AgentAutoName extends AgentBase {
  static agentName = 'auto-name';

  constructor(service: AgentService) {
    super(service);
  }

  /** @override */
  protected async processSystemPrompt(context: AgentRequestContext) {
    context.checkStop();

    context.system = `<role>
你是文章标题撰写大师
</role>
    
<todo>
请根据用户提供的文本，生成精炼、贴合的标题。
</todo>

<output-rules>
输出要求：仅输出标题，禁止输出其他任何多余内容。
</output-rules>`;
  }

  /** @override */
  protected async processUserPrompt(context: AgentRequestContext) {
    context.checkStop();

    context.user = `用户提供的文本如下：

${context.query}`;
  };
}
