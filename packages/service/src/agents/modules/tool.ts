import type { ToolHandleResult, ToolOptions } from '../types';
import type { AgentBase } from './agent';
import type { AgentRequestContext } from './context';

export class AgentTool {
  private _agent: AgentBase;

  get db() {
    return this._agent.service.db;
  }

  options: ToolOptions;

  /** 工具名称 */
  get name() {
    return this.options.name;
  }

  /** 是否记忆 */
  get memoryEnabled() {
    return this.options.memory || true;
  }

  /** 记忆有效期 */
  get memoryTtl() {
    return this.options.memoryTtl || 30;
  }

  constructor(agent: AgentBase, options: ToolOptions) {
    this._agent = agent;
    this.options = options;
  }

  async execute(params: Record<string, any>, context: AgentRequestContext): Promise<ToolHandleResult> {
    try {
      const res = await this.options.handler(params, context);
      return {
        name: this.name,
        params,
        ...res,
      };
    }
    catch (e: any) {
      return {
        name: this.name,
        params,
        state: 'failed',
        result: `工具 ${this.options.name} 执行失败，失败原因：${e.message}`,
        output: false,
      };
    }
  }

  toPrompt() {
    return `### ${this.options.name}

**描述**：

${this.options.description}

**参数**：

${this._toParamsPrompt()}

**使用方法**：

${this._toExamplePrompt()}
`;
  }

  private _toParamsPrompt() {
    return this.options.parameters
      .map(param => (`- ${param.name}${param.required ? '' : ''}: ${param.description}`))
      .join('\n');
  }

  private _toExamplePrompt() {
    return `<use-tool label="${this.options.label}">
<${this.options.name}>
${this.options.parameters.map(param => (`<${param.name}>${param.briefDescription || param.description}</${param.name}>`)).join('\n')}
</${this.options.name}>
</use-tool>`;
  }
}
