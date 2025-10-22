import {
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserDto } from './base-chat.dto';

/** 兼容 dify，重命名入参 */
export class RenameDto extends UserDto {
  /** （选填）名称，若 auto_generate 为 true 时，该参数可不传。 */
  @IsString()
  @IsOptional()
  name?: string;

  /** （选填）自动生成标题，默认 false。 */
  @IsBoolean()
  @IsOptional()
  auto_generate?: boolean;
}
