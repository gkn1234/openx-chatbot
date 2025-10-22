<script setup lang="ts">
import type { ChatFlow } from '@app/modules'
import chatImg from '@app/assets/chat.png'
import { ChatApp } from '@app/modules'

const app = ChatApp.use()
const {
  navChatFlows,
  activeChatFlowId,
  activeChatFlow,
} = app
const {
  isAboveSm,
  navMode,
  isDrawerNavCollapsed,
  collapseDrawer,
} = app.nav

function mouseLeaveHandler() {
  if (isAboveSm.value && navMode.value === 'drawer' && !isDrawerNavCollapsed.value) {
    collapseDrawer.value = true
  }
}

function selectHandler(target: ChatFlow) {
  if (activeChatFlowId.value === target.id) {
    return
  }

  // 选中一个对话框后，会加载历史信息，历史信息加载等待地过程中，不许连续切换
  if (activeChatFlow.value?.isLoading.value) {
    return
  }

  target.active()
}

function deleteHandler(target: ChatFlow) {
  ElMessageBox.confirm(`确认删除对话 "${target.titleDisplay.value}" 吗？`, '提示', {
    type: 'warning',
  }).then(() => {
    target.remove()
    target.delete()
  })
}

function addClickHandler() {
  app.toHome()
}
</script>

<template>
  <div class="nav-inner" @mouseleave="mouseLeaveHandler">
    <ChatNavTitle p="t-12px l-16px r-10px b-16px" />
    <div p="x-12px" flex="shrink-0" m="b-8px">
      <div class="add-btn" @click="addClickHandler">
        <i
          i="mdi-add"
          text="24px" />
        <span font="bold" m="l-6px">新对话</span>
      </div>
    </div>
    <ul class="flow-item-list">
      <li
        v-for="item in navChatFlows"
        :key="item.id"
        class="flow-item"
        :class="{ 'is-active': activeChatFlowId === item.id }"
        @click="selectHandler(item)">
        <user-avatar size="20px" :src="item.avatar.value" :default-src="chatImg" />
        <span
          text="14px"
          class="truncate"
          m="r-4px l-8px"
          :title="item.titleDisplay.value">{{ item.titleDisplay.value }}</span>
        <i
          class="flow-item-close"
          i="ep-circle-close-filled"
          m="l-auto"
          text="16px"
          flex="shrink-0"
          hidden
          title="删除对话"
          c="placeholder hover:primary"
          @click.stop="deleteHandler(item)" />
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.nav-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  color: var(--el-text-color-primary);
  background-color: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color-light);
}

.add-btn {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  color: var(--el-color-primary);
  cursor: pointer;
  background-color: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
  border-radius: 12px;

  &:hover {
    background-color: var(--el-color-primary-light-7);
  }
}

.flow-item-list {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  gap: 2px;
  height: 0;
  padding: 12px;
  overflow-y: auto;
}

.flow-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  border-radius: 12px;

  &.is-active {
    font-weight: bold;
    background-color: var(--el-color-white);
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 5%);

    &:hover {
      background-color: var(--el-color-white);
    }
  }

  &:hover {
    background-color: rgb(0 0 0 / 4%);

    .flow-item-close {
      display: inline-block;
    }
  }
}
</style>
