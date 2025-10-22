import {
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { UserDto } from './base-chat.dto';

/** 兼容 dify，历史消息入参 */
export class HistoryDto extends UserDto {
  /** 会话 ID */
  @IsString()
  conversation_id!: string;

  /** 当前页第一条聊天记录的 ID，默认 null */
  @IsString()
  @IsOptional()
  first_id?: string | null;

  /**
   * 一次请求返回多少条聊天记录。
   * @default 20
   */
  @IsPositive()
  @IsOptional()
  limit?: number;
}
