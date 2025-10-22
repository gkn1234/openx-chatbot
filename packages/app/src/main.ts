import {
  furionInit,
  furionTracker,
  tracker,
} from '@openx/track';
import { api } from './api';
import App from './app.vue';
import { router } from './router';
import './styles/index.scss';
import 'element-plus/theme-chalk/src/index.scss';
import 'virtual:uno.css';

furionInit({
  furionUrl: `https://res.hc-cdn.com/FurionSdkStatic/3.6.10/furion-cdn.min.js`,
  appId: '0C9BF2AA146D482382DBE0E30947824D',
  crossOriginApi: true,
});

const app = createApp(App);

app.config.warnHandler = (msg, instance, trace) => {
  // 过滤掉插槽相关的警告
  if (msg.startsWith('Non-function value encountered for')) {
    return;
  }

  console.warn(`[Vue warn]: ${msg}`, instance, trace);
};

app
  .use(router)
  .use(api)
  .use(tracker, {
    init: (instance) => {
      instance.add(furionTracker);
    },
    disableLog: import.meta.env.MODE === 'production',
  });

app.mount('#app');
