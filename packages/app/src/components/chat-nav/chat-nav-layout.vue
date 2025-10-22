<script setup lang="ts">
import { ChatApp } from '../../modules'

const app = ChatApp.use()
const {
  isAboveSm,
  navMode,
  collapseDrawer,
  isDrawerNavCollapsed,
} = app.nav

const width = '280px'
</script>

<template>
  <div class="chat-nav-layout" v-bind="$attrs" :class="{ 'chat-nav-layout-drawer': navMode !== 'menu' }">
    <div class="chat-nav-layout-sidebar">
      <slot />
    </div>
    <div class="chat-nav-layout-content">
      <slot name="content" />
    </div>
  </div>
  <el-drawer
    :model-value="!isDrawerNavCollapsed"
    direction="ltr"
    :with-header="false"
    :size="width"
    :modal="navMode === 'drawer' && !isAboveSm"
    body-class="p-0!"
    @close="collapseDrawer = true">
    <slot />
  </el-drawer>
</template>

<style scoped lang="scss">
.chat-nav-layout-sidebar {
  position: absolute;
  top: 0;
  left: 0;
  width: v-bind(width);
  height: 100%;
  transition: transform 300ms ease;
}

.chat-nav-layout-content {
  height: 100%;
  padding-left: v-bind(width);
  transition: padding 300ms ease;
}

.chat-nav-layout {
  position: relative;

  &.chat-nav-layout-drawer {
    .chat-nav-layout-sidebar {
      transform: translateX(-100%);
    }

    .chat-nav-layout-content {
      padding-left: 0;
    }
  }
}
</style>
