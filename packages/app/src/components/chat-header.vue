<script setup lang="ts">
import { ChatApp } from '../modules';

const app = ChatApp.use();
const {
  user,
  userAvatar: userAvatarSrc,
  userName,
} = app;
const { navCollapsed } = app.config;
const {
  isAboveSm,
  collapseDrawer,
  navMode,
} = app.nav;

const userTooltipContent = computed(() => {
  return user.value ? `${userName.value} ${user.value}` : '未登录';
});

function closeHandler() {
  app.proxy.postMessage({
    type: 'close',
  });
}
</script>

<template>
  <header class="chat-header">
    <div flex="~ items-center">
      <icon-operation
        v-if="!isAboveSm"
        :tip-content="collapseDrawer ? '展开侧边栏' : '收起侧边栏'"
        tip-place="bottom"
        icon-class="i-mdi-menu"
        m="r-8px"
        @click="collapseDrawer = !collapseDrawer" />
      <ChatNavTitle
        v-if="navMode !== 'menu'"
        m="r-8px"
        logo-size="30px"
        text-size="14px" />
      <icon-operation
        v-if="isAboveSm"
        :tip-content="navCollapsed ? '展开侧边栏' : '收起侧边栏'"
        tip-place="bottom"
        :icon-class="navCollapsed ? 'i-mdi-format-horizontal-align-right' : 'i-mdi-format-horizontal-align-left'"
        @click="navCollapsed = !navCollapsed" />
    </div>
    <div flex="~ items-center" gap="4px">
      <el-tooltip effect="light" :content="userTooltipContent" placement="bottom">
        <user-avatar :src="userAvatarSrc" size="30px" />
      </el-tooltip>

      <icon-operation
        tip-content="关闭"
        tip-place="bottom"
        icon-class="i-ep-close"
        @click="closeHandler" />
    </div>
  </header>
</template>

<style scoped lang="scss">
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  background-color: var(--el-bg-color-base);
}

.chat-logo {
  width: 36px;
  height: 36px;
  margin-right: 4px;
  pointer-events: none;
}
</style>
