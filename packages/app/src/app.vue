<script setup lang="ts">
// import { useApi } from '@app/api';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import { useChatSkillsPreset } from './components/chat-skill/composables/preset';
import { ChatApp } from './modules';

const app = ChatApp.init();

app.on('onBuzy', () => {
  ElNotification.warning({
    title: '当前有对话内容正在生成中，请稍候',
  });
});

useChatSkillsPreset(app);

/*
const { main } = useApi();
main.get('/index/admin/info1').then((res) => {
  app.user.value = res.name;
  app.userName.value = res.nickName;
  app.userAvatar.value = res.avatar;
});
*/
app.user.value = 'guest';
app.userName.value = '访客';
app.userAvatar.value = '';
</script>

<template>
  <el-config-provider :locale="(zhCn as any)">
    <router-view />
  </el-config-provider>
</template>
