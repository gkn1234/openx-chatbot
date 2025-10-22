import type { AgentBase } from '../modules';
import {
  getProjectById,
  getProjectDetail,
  getProjectEspaceGroups,
  getProjectInnerSourceGrade,
} from '../../api/openx';
import {
  OPENX_WEBSITE_URL,
} from '../../utils';
import { AgentTool } from '../modules';

export function getProjectInfoByIdTool(agent: AgentBase) {
  return new AgentTool(agent, {
    name: 'get-project-info-by-id',
    label: '获取内源项目详情',
    description: `通过内源项目的 ID，获取内源项目的详细信息。详细信息中包括项目名称、描述、Owner、代码仓地址等内容。

详细信息的具体数据结构如下：
\`\`\`ts
interface ProjectDetail {
  /** 项目 id */
  id: number

  /** 项目名称 */
  projectName: string

  /** 项目介绍信息 */
  projectIntroduction: string

  /** 项目类别 */
  projectType: '内源优选项目' | '民间项目'

  /** 访问地址 */
  url: string

  /** 代码仓地址 */
  codehubUrl: string

  /** 内源指数 */
  innerSourceGrade: string

  /** 创建时间 */
  projectInitiatingTime: string

  /** 负责人(Owner)工号 */
  projectPrimaryOwner: string

  /** 负责人(Owner)姓名 */
  projectPrimaryOwnerName: string

  /** 所属社区 */
  projectHomeCommunity: string

  /** 关注数量 */
  projectFollowingAmount: string

  /** 下载数量 */
  projectDownloads: string

  /** 分享数量 */
  projectSharingAmount: string

  /** 浏览数量 */
  projectVisits: string

  /** 编程语言 */
  lang: string

  /** 所属领域 */
  object: string

  /** Welink交流帮助群 */
  welinkGroups: string
}
\`\`\`
`,
    parameters: [
      {
        name: 'project-id',
        type: 'number',
        description: '内源项目 ID，决定了要获取哪个项目的信息',
        briefDescription: '内源项目 ID',
        required: true,
      },
    ],
    handler: async (params) => {
      const res = await getProjectInfoById(params['project-id']);
      return {
        state: 'success',
        result: JSON.stringify(res),
        reason: '',
        output: false,
      };
    },
  });
}

export async function getProjectInfoById(id: number) {
  const res = await getProjectById(id);

  const [projectDetail, groups, grades] = await Promise.all([
    getProjectDetail(res.projectName),
    getProjectEspaceGroups(res.id),
    getProjectInnerSourceGrade(res.id),
  ]);

  projectDetail.url = `${OPENX_WEBSITE_URL}/${projectDetail.projectName}`;
  projectDetail.lang = (projectDetail.lang || []).join(',');
  projectDetail.object = (projectDetail.object || []).map(o => o.NAME).join(',');
  projectDetail.welinkGroups = groups.map(g => `${g.group_id}(${g.group_name})`).join(',');
  projectDetail.innerSourceGrade = grades?.innerSourceGrade || 0;
  return projectDetail;
}
