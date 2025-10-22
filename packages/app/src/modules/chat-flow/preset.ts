import type { ChatFlowInfo } from './types';

export function defaultChatflowPreset(): ChatFlowInfo[] {
  return [
    {
      id: 1,
      key: import.meta.env.VITE_DIFY_CHAT_KEY,
      name: '内源问答助手',
      description: '能够回答内源平台以及内源项目的 RAG 智能体，传递项目(或社区)参数后，将会参考对应项目(或社区)的知识库回答问题。',
      baseUrl: import.meta.env.VITE_DIFY_URL,
    },
    {
      id: 2,
      key: import.meta.env.VITE_DIFY_REPORT_KEY,
      name: '内源项目报告生成助手',
      description: '能够为内源项目生成报告的智能体。',
      baseUrl: import.meta.env.VITE_DIFY_URL,
    },
    {
      id: 3,
      key: '',
      name: '内源问答助手(Agent)',
      description: '能够回答内源平台以及内源项目的 RAG 智能体，传递项目(或社区)参数后，将会参考对应项目(或社区)的知识库回答问题。',
      baseUrl: '/api/agent',
    },
  ];
}

export function defaultWorkflowPreset(): ChatFlowInfo[] {
  return [
    {
      id: 1,
      key: import.meta.env.VITE_DIFY_WF_WEB_DESC_KEY,
      name: '网页摘要',
      baseUrl: import.meta.env.VITE_DIFY_URL,
    },
    {
      id: 2,
      key: import.meta.env.VITE_DIFY_WF_WELINK_DESC_KEY,
      name: 'Welink 聊天记录摘要',
      baseUrl: import.meta.env.VITE_DIFY_URL,
    },
  ];
}
