import type { AgentBase, AgentRequestContext } from '../modules';
import { difyDatasetRequest } from '../../api/request/dify';
import { AgentTool } from '../modules';

export interface KnowledgeDetailItem {
  projectName: string

  url: string

  title: string

  content: string
}

export function getKnowledgeTool(agent: AgentBase) {
  return new AgentTool(agent, {
    name: 'get-knowledge',
    label: '知识库查询',
    description: `给定关键字，从指定内源项目的知识库中检索专业知识。

每次调用只取一个关键字，而不是在一次调用中以空格或逗号分隔多个关键字。如果有多个关键字，请分多次调用此工具，

关键字示例：

<good_example>
内源流水线
</good_example>

<bad_example>
内源流水线 构建 部署
</bad_example>
`,
    parameters: [
      {
        name: 'project-id',
        type: 'string',
        description: '内源项目 ID，决定了从哪个项目的知识库中检索',
        briefDescription: '内源项目 ID',
        required: true,
      },
      {
        name: 'query',
        type: 'string',
        description: '知识库检索关键字',
        briefDescription: '检索关键字',
        required: true,
      },
    ],
    handler: async (params, context) => {
      const res = await getKnowledge(params, context);
      return {
        state: 'success',
        result: res,
        reason: '',
        output: false,
      };
    },
  });
}

export async function getKnowledge(
  params: Record<string, any>,
  context: AgentRequestContext,
) {
  const { dataset_id } = await context.db.t_mlops_dataset.findFirstOrThrow({
    select: { dataset_id: true },
    where: { belong_id: params['project-id'] },
  });
  const res = await difyDatasetRequest.post('/datasets/{dataset_id}/retrieve', {
    query: params.query,
    retrieval_model: {
      search_method: 'hybrid_search',
      reranking_enable: true,
      reranking_mode: 'reranking_model',
      reranking_model: {
        reranking_provider_name: 'chenyuxuan/mlops/mlops',
        reranking_model_name: 'BAAI/bge-reranker-v2-m3',
      },
      top_k: 5,
      score_threshold_enabled: true,
      score_threshold: 0.4,
    },
  }, {
    path: { dataset_id },
  });

  const results = res.records.map((record) => {
    const { content } = record.segment;
    const {
      url = '',
      title = '',
      description: projectName = '',
    } = record.segment.document.doc_metadata || {};

    return {
      title,
      url,
      projectName,
      content,
    };
  });

  const knowledgeContext = await context.service.blockRequest({
    user: context.userId,
    name: 'get-knowledge',
    query: context.query,
    response_mode: 'blocking',
    title: '工具调用：get-knowledge',
    type: 'sub',
    inputs: {
      rawKnowledgeResult: results,
    },
  }, context);

  return knowledgeContext.finalResult;
}
