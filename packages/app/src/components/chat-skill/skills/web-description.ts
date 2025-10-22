// @unocss-include
import type { ChatApp, ChatFlow, InputSkillOptions } from '@app/modules';
import { defaultWorkflowPreset } from '@app/modules';
import { getParams } from './ask-project';

export function webDescriptionSkill(app: ChatApp): InputSkillOptions {
  const workflows = defaultWorkflowPreset();

  function workflowAction(flow: ChatFlow) {
    const targetWorkflow = workflows.find(w => w.id === 1);
    if (!targetWorkflow) {
      app.logger.warn('Can not find workflow');
      return;
    }

    flow.createItem({
      type: 'common',
      role: 'user',
      content: '请总结当前网页内容',
    });

    flow.workflow({
      key: targetWorkflow.key,
      baseUrl: targetWorkflow.baseUrl,
      asyncInputs: async () => {
        const inputs = await app.proxy.getDataFromClient('pageContent');
        return inputs || {
          type: 'summary',
          content: document.querySelector('.home-content')?.textContent || '',
        };
      },
    });
  }

  return {
    key: 'web-description',
    name: '网页摘要',
    description: '为当前网站内容生成摘要',
    iconClass: 'i-mdi-file-document-multiple-outline',
    iconColor: '#0057ff',
    createTrigger: () => {
      const flow = app.createChatFlowByPreset({
        chatFlowId: 1,
        inputs: getParams(app),
      });

      if (!flow) {
        return;
      }

      workflowAction(flow);
    },
    chattingTrigger: () => {
      const flow = app.activeChatFlow.value;

      if (!flow) {
        return;
      }

      workflowAction(flow);
    },
  };
}
