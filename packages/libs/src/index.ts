import type { ChatClientOptions } from '@openx/chatbot-app/client';
import { ChatClient } from '@openx/chatbot-app/client';
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import {
  createApp,
  defineComponent,
  h,
} from 'vue';
import ChatTips from './chat-tips.vue';

const OPENX_CHATBOT_ID = '__openxChatbot__';

export function mount(options: ChatClientOptions) {
  const existedTarget = document.getElementById(OPENX_CHATBOT_ID);
  if (existedTarget) {
    existedTarget.remove();
  }

  const wrapper = document.createElement('div');
  wrapper.id = OPENX_CHATBOT_ID;

  const client = new ChatClient(options);
  const App = defineComponent({
    setup() {
      client.provide();
    },
    render() {
      return h(ElConfigProvider, {
        locale: zhCn,
        namespace: import.meta.env.IS_BUILD_ALL ? 'opct' : 'el',
      }, () => [
        h(ChatTips),
      ]);
    },
  });

  document.body.appendChild(wrapper);
  createApp(App).mount(wrapper);

  return client;
}

export type * from '@openx/chatbot-app';
