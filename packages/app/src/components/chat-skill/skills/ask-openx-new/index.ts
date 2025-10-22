// @unocss-include
import type { ChatApp, InputSkillOptions } from '@app/modules';

const key = 'ask-openx-new';

export function setOpenxNewSkill(app: ChatApp) {
  app.input.activeKey.value = key;
}

function getParams() {
  return { name: 'chat' };
}

export function askOpenxNewSkill(app: ChatApp): InputSkillOptions {
  return {
    key,
    name: '向 OpenX 提问(New)',
    description: 'Agent 版：询问关于内源机制、OpenX 平台使用等信息',
    iconClass: 'i-mdi-tooltip-question-outline',
    iconColor: '#c7000b',
    createTrigger: () => {
      setOpenxNewSkill(app);
    },
    chattingTrigger: () => {
      ElMessageBox.confirm(`切换该技能需要返回首页并创建新对话`, '提示', {
        type: 'warning',
      }).then(() => {
        setOpenxNewSkill(app);
        app.toHome();
      });
    },
    createSendMessage: (query) => {
      const flow = app.createChatFlowByPreset({
        chatFlowId: 3,
        inputs: getParams(),
      });

      if (!flow) {
        return;
      }

      flow.chat(query).catch((e) => {
        if (e instanceof Error && e.isStreamStopped) {
          return;
        }

        ElNotification.error({
          title: '问答请求出现错误',
          message: e.message,
        });
      });
    },
    chattingSendMessage: (query) => {
      const flow = app.activeChatFlow.value;

      if (!flow) {
        return;
      }

      flow.chat(query).catch((e) => {
        if (e instanceof Error && e.isStreamStopped) {
          return;
        }

        ElNotification.error({
          title: '问答请求出现错误',
          message: e.message,
        });
      });
    },
  };
}
