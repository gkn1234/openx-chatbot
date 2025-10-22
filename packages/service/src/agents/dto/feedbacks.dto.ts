import {
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserDto } from './base-chat.dto';

/** 兼容 dify，反馈入参 */
export class FeedbacksDto extends UserDto {
  /** 点赞 like, 点踩 dislike, 撤销点赞 null */
  @IsIn(['like', 'dislike', null])
  rating!: 'like' | 'dislike' | null;

  /** （选填）消息反馈的具体信息。 */
  @IsString()
  @IsOptional()
  content?: string;
}
