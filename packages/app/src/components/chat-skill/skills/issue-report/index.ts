// @unocss-include
import type { ChatApp, InputSkillOptions } from '@app/modules';

const key = 'issue-report';

function setSkill(app: ChatApp, id: number) {
  app.input.activeKey.value = key;
  app.input.params.value.belongingId = id;
  app.input.params.value.belongingType = 'project';
}

function getParams(app: ChatApp) {
  return {
    project_id: app.input.params.value.belongingId,
  };
}

export function issueReportSkill(app: ChatApp): InputSkillOptions {
  return {
    key,
    name: '生成项目报告',
    description: '请输入项目报告生成的时间范围，例如：本月、本季度',
    iconClass: 'i-mdi-file-report-outline',
    iconColor: '#48c466',
    createTrigger: () => {
      setSkill(app, app.input.params.value.belongingId);
    },
    chattingTrigger: () => {
      ElMessageBox.confirm(`切换该技能需要返回首页并创建新对话`, '提示', {
        type: 'warning',
      }).then(() => {
        setSkill(app, app.input.params.value.belongingId);
        app.toHome();
      });
    },
    createSendMessage: (query) => {
      const flow = app.createChatFlowByPreset({
        chatFlowId: 2,
        inputs: getParams(app),
        title: `${app.input.params.value.belongingName}项目报告`,
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
