<script setup lang="ts">
import { ChatInputMenuContext } from './composables/menu'

const context = new ChatInputMenuContext()
const {
  GAP_SIZE,
  wrapperEl,
  menuEl,
  wrapperWidth,
  isCollapse,
} = context

const gapCss = `${GAP_SIZE}px`
</script>

<template>
  <div ref="wrapperEl" class="chat-input-menu">
    <slot />
    <el-popover placement="bottom-start" width="auto" :popper-style="{ 'padding': '2px', 'border-radius': '10px', 'min-width': 'auto' }">
      <template #reference>
        <el-button v-show="isCollapse" class="chat-input-menu-collapse-button" flex="shrink-0">
          <i i="mdi-dots-horizontal" text="16px" />
        </el-button>
      </template>
      <ul ref="menuEl" class="chat-input-menu-selection" />
    </el-popover>
  </div>
</template>

<style scoped lang="scss">
.chat-input-menu {
  display: flex;
  gap: v-bind(gapCss);
  align-items: center;
  min-width: 0;
  overflow-x: hidden;
}

.chat-input-menu-collapse-button {
  height: 36px;
  padding: 8px 12px;
  color: var(--el-text-color-primary);
  border-color: var(--el-border-color-lighter);
  border-radius: 10px;

  &:hover {
    background-color: var(--el-bg-color-page);
  }
}

.chat-input-menu-selection {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
</style>
