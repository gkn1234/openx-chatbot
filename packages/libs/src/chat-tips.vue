<script setup lang="ts">
import { ChatClient } from '@openx/chatbot-app/client';
import { delay } from '@openx/utils';
import {
  onBeforeUnmount,
  ref,
} from 'vue';
import ChatDrawer from './chat-drawer.vue';

const {
  visible,
  options,
  tipVisible,
} = ChatClient.use();

const watingTime = options.waiting || 0;
if (watingTime >= 0) {
  delay(options.waiting || 0).then(() => {
    tipVisible.value = true;
  });
}

const el = ref<HTMLDivElement>();
let offsetY = 0;

function doDrag(e: MouseEvent) {
  if (!el.value) {
    return;
  }

  const dom = el.value;
  // 计算按钮的新位置
  let newY = e.clientY - offsetY;

  // 获取屏幕的宽度和高度
  const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  if (newY < 0) {
    newY = 0;
  }
  else if (newY + dom.offsetHeight > screenHeight) {
    newY = screenHeight - dom.offsetHeight;
  }
  dom.style.top = `${newY}px`;
}

function mousedownHandler(e: MouseEvent) {
  if (!el.value) {
    return;
  }

  offsetY = e.clientY - el.value.offsetTop;

  document.addEventListener('mousemove', doDrag);
}

document.addEventListener('mouseup', mouseupHandler);
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', doDrag);
  document.removeEventListener('mouseup', mouseupHandler);
});

function mouseupHandler() {
  document.removeEventListener('mousemove', doDrag);
}

function clickHandler() {
  visible.value = true;
}
</script>

<template>
  <div
    v-show="tipVisible"
    ref="el"
    class="openx-chat-tips"
    @mousedown="mousedownHandler"
    @click="clickHandler">
    <img class="chat-logo" src="./assets/ai-chat.png">
    <span class="openx-chat-tips-name">问答助手</span>
  </div>

  <ChatDrawer />
</template>

<style scoped lang="scss">
.openx-chat-tips {
  position: fixed;
  right: 0;
  bottom: 100px;
  z-index: 1999;
  display: flex;
  align-items: center;
  height: 42px;
  padding: 0 24px 0 8px;
  cursor: pointer;
  user-select: none;
  background-color: #fff;
  border-radius: 21px;
  box-shadow: 0 3px 6px 0 rgb(0 0 0 / 16%);
  transform: translateX(96px);
  transition: transform 0.2s ease-in-out;

  &:hover {
    background-color: #f2f3f5;
    transform: translateX(18px);
  }

  .chat-logo {
    width: 36px;
    height: 36px;
    pointer-events: none;
  }
}

.openx-chat-tips-name {
  margin-left: 4px;
  font-size: 18px;
  font-weight: 700;
  color: #333;
}
</style>
