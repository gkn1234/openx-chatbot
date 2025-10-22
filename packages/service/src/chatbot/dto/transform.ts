import {
  IsIn,
  IsString,
} from 'class-validator';

export class TransformDto {
  /**
   * 业务类型
   * - readme README
   * - wiki WIKI
   * - dynamic 项目动态
   * - post 社区帖子
   */
  @IsIn(['readme', 'wiki', 'dynamic', 'post'])
  type!: 'wiki' | 'readme' | 'dynamic' | 'post';

  /**
   * 内容类型
   * - markdown
   * - html 富文本
   */
  @IsIn(['markdown', 'html'])
  contentType!: 'markdown' | 'html';

  /** 待转化内容 */
  @IsString()
  content!: string;
}
