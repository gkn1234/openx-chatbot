// @unocss-include
import type { ChatApp, InputSkillOptions } from '@app/modules';

const key = 'ask-openx';

export function setOpenxSkill(app: ChatApp) {
  app.input.activeKey.value = key;
}

function getParams(app: ChatApp) {
  return {
    think: app.input.params.value.think ? '启用' : '禁用',
    w3: app.input.params.value.search ? '启用' : '禁用',
    belonging_type: 'project',
    belonging_id: 2,
  };
}

export function askOpenxSkill(app: ChatApp): InputSkillOptions {
  return {
    key,
    name: '向 OpenX 提问',
    description: '询问关于内源机制、OpenX 平台使用等信息',
    iconClass: 'i-mdi-tooltip-question-outline',
    iconColor: '#c7000b',
    createTrigger: () => {
      setOpenxSkill(app);
    },
    chattingTrigger: () => {
      ElMessageBox.confirm(`切换该技能需要返回首页并创建新对话`, '提示', {
        type: 'warning',
      }).then(() => {
        setOpenxSkill(app);
        app.toHome();
      });
    },
    createSendMessage: (query) => {
      const flow = app.createChatFlowByPreset({
        chatFlowId: 1,
        inputs: getParams(app),
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
    leftOperations: () => import('./left.vue').then(m => m.default),
  };
}
