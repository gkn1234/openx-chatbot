// @unocss-include
import type { ChatApp, InputSkillOptions } from '@app/modules';

const key = 'deep-search';

export function setDeepSearchSkill(app: ChatApp) {
  app.input.activeKey.value = key;
}

function getParams() {
  return { name: 'chat' };
}

export function deepSearchSkill(app: ChatApp): InputSkillOptions {
  return {
    key,
    name: '搜索提问',
    description: '根据网络搜索结果回答问题',
    iconClass: 'i-mdi-tooltip-question-outline',
    iconColor: '#c7000b',
    createTrigger: () => {
      setDeepSearchSkill(app);
    },
    chattingTrigger: () => {
      ElMessageBox.confirm(`切换该技能需要返回首页并创建新对话`, '提示', {
        type: 'warning',
      }).then(() => {
        setDeepSearchSkill(app);
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
