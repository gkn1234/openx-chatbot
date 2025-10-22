import type { AgentBase } from '../modules';
import {
  searchFromWebsite,
} from '../../api/openx';
import { AgentTool } from '../modules';

type SearchResult = {
  /** 相关项目 id */
  id: number

  /** 相关项目名称 */
  name: string

  /** 相关介绍信息 */
  introduction: string
}[];

export function searchProjectByKeywordTool(agent: AgentBase) {
  return new AgentTool(agent, {
    name: 'search-project-by-keyword',
    label: '搜索内源项目',
    description: `从用户的提问中推断出项目名称，使用该名称作为关键字，尝试搜索相关的内源项目，确定项目 ID。

搜索结果会呈现为一个列表，详细信息的具体数据结构如下：
\`\`\`ts
type SearchResult = {
  /** 相关项目 id */
  id: number

  /** 相关项目名称 */
  name: string

  /** 相关介绍信息 */
  introduction: string
}[]
\`\`\`

后续可以进一步向用户询问，提问与哪个项目相关。
`,
    parameters: [
      {
        name: 'infer-project-name',
        type: 'string',
        description: '从用户提问的信息中推断出的项目名称，作为项目搜索关键字',
        briefDescription: '推断的内源项目名称',
        required: true,
      },
    ],
    handler: async (params) => {
      const res = await searchProjectByKeyword(params['infer-project-name']);
      return {
        state: 'success',
        result: JSON.stringify(res),
        reason: '',
        output: false,
      };
    },
  });
}

const OPENX_PROJECT_ID = 2;

async function searchProjectByKeyword(inferName: string) {
  const res = await searchFromWebsite({
    words: inferName,
    pageNum: 1,
    pageSize: 10,
    type: 'project',
    sortType: '',
  });

  const results: SearchResult = (res.result.info || []).map(project => ({
    id: project.projectId,
    name: project.name,
    introduction: project.introduction,
  }));

  results.unshift({
    id: 0,
    name: '非内源项目问题',
    introduction: '问题与内源、OpenX、内源平台、内源项目均无关联',
  });

  if (!results.some(item => item.id === OPENX_PROJECT_ID)) {
    results.unshift({
      id: OPENX_PROJECT_ID,
      name: 'OpenX',
      introduction: '华为公司内源平台OpenX，是公司内源项目品牌的统一门户，是华为内源的官方网站，为内源项目和社区提供数字化运营支持，为内源项目和社区提供IT基础设施。',
    });
  }

  return results;
}
