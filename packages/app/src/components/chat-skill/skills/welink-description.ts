// @unocss-include
import type { ChatApp, ChatFlow, InputSkillOptions } from '@app/modules';
import { defaultWorkflowPreset } from '@app/modules';
import { getParams } from './ask-project';

export function welinkDescriptionSkill(app: ChatApp): InputSkillOptions {
  const workflows = defaultWorkflowPreset();

  function workflowAction(flow: ChatFlow, content: string) {
    const targetWorkflow = workflows.find(w => w.id === 2);
    if (!targetWorkflow) {
      app.logger.warn('Can not find workflow');
      return;
    }

    flow.createItem({
      type: 'common',
      role: 'user',
      content: '请总结 Welink 聊天记录的内容',
    });

    flow.workflow({
      key: targetWorkflow.key,
      baseUrl: targetWorkflow.baseUrl,
      inputs: {
        content: content || '获取 Welink 聊天记录失败',
      },
    });
  }

  return {
    key: 'welink-description',
    name: 'Welink 聊天记录摘要',
    description: '为 Welink 聊天记录内容生成摘要',
    iconClass: 'i-mdi-file-document-multiple-outline',
    iconColor: '#0057ff',
    hidden: true,
    createTrigger: (content: string) => {
      const flow = app.createChatFlowByPreset({
        chatFlowId: 1,
        inputs: getParams(app),
      });

      if (!flow) {
        return;
      }

      workflowAction(flow, content);
    },
    chattingTrigger: (content: string) => {
      const flow = app.activeChatFlow.value;

      if (!flow) {
        return;
      }

      workflowAction(flow, content);
    },
  };
}
