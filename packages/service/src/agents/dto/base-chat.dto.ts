import type { ChatConversationType } from '@openx/db-ai';
import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserDto {
  /** 用户标识，用于定义终端用户的身份，方便检索、统计。 由开发者定义规则，需保证用户标识在应用内唯一。 */
  @IsString()
  user!: string;
}

/** 兼容 dify */
export class BaseChatDto extends UserDto {
  /** Agent 名称 */
  @IsString()
  name!: string;

  /** 用户输入 / 提问内容 */
  @IsString()
  query!: string;

  /**
   * 使用模型，
   *
   * 传入格式：提供商/模型名称。例如：mlops/qwen235b
   *
   * 若找不到模型，则使用 Agent 默认的模型
   */
  @IsString()
  @IsOptional()
  model?: string;

  /**
   * 会话类型
   * @default 'main'
   */
  @IsIn(['main', 'sub'])
  @IsOptional()
  type?: ChatConversationType;

  /** 初始标题设置 */
  @IsString()
  @IsOptional()
  title?: string;

  /**
   * 允许传入 App 定义的各变量值。
   * inputs 参数包含了多组键值对（Key/Value pairs），每组的键对应一个特定变量，每组的值则是该变量的具体值
   */
  @IsObject()
  @IsOptional()
  inputs?: Record<string, any>;

  /**
   * 内容返回形式
   * - streaming 流式模式
   * - blocking 阻塞模式
   */
  @IsIn(['streaming', 'blocking'])
  response_mode!: 'streaming' | 'blocking';

  /** 会话 ID，需要基于之前的聊天记录继续对话，必须传之前消息的 conversation_id。 */
  @IsString()
  @IsOptional()
  conversation_id?: string;
}
