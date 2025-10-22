// @unocss-include
import type { ChatApp, InputSkillOptions } from '@app/modules';

const key = 'ask-project';

function setProjectSkill(app: ChatApp, id: number) {
  app.input.activeKey.value = key;
  app.input.params.value.belongingId = id;
  app.input.params.value.belongingType = 'project';
}

export function getParams(app: ChatApp) {
  return {
    think: app.input.params.value.think ? '启用' : '禁用',
    w3: app.input.params.value.search ? '启用' : '禁用',
    belonging_type: app.input.params.value.belongingType || 'project',
    belonging_id: app.input.params.value.belongingId || 2,
  };
}

export function askProjectSkill(app: ChatApp): InputSkillOptions {
  return {
    key,
    name: '问内源项目',
    description: '询问内源项目的使用方法、疑难问题',
    iconClass: 'i-mdi-lightbulb-question-outline',
    iconColor: '#ff9500',
    createTrigger: () => {
      setProjectSkill(app, app.input.params.value.belongingId);
    },
    chattingTrigger: () => {
      ElMessageBox.confirm(`切换该技能需要返回首页并创建新对话`, '提示', {
        type: 'warning',
      }).then(() => {
        setProjectSkill(app, app.input.params.value.belongingId);
        app.toHome();
      });
    },
    createSendMessage: (query) => {
      const flow = app.createChatFlowByPreset({
        chatFlowId: 1,
        inputs: getParams(app),
        title: `${app.input.params.value.belongingName}问答助手`,
        avatar: app.input.params.value.belongingLogo,
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
