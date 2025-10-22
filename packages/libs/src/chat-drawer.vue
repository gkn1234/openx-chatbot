<script setup lang="ts">
import { ChatClient } from '@openx/chatbot-app/client';
import { ElDrawer, vLoading } from 'element-plus';
import { debounce } from 'lodash-es';
import {
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue';

const iframeEl = ref<HTMLIFrameElement>();
const client = ChatClient.use();
watch(iframeEl, (el) => {
  if (!el) {
    return;
  }

  client.proxy.setup(el);
});
onBeforeUnmount(() => {
  client.proxy.destroy();
});

const {
  options,
  loading,
  size,
  visible,
} = client;

if (options.preload) {
  visible.value = true;
  nextTick(() => {
    visible.value = false;
  });
}

const setSizeConfig = debounce((width: number) => {
  client.proxy.postMessage({
    action: 'setConfig',
    params: [{ width }],
  });
}, 300);

// 抽屉内容样式处理
const bodyEl = ref<HTMLElement>();
watch(bodyEl, (el) => {
  if (!el || !el.parentElement) {
    return;
  }

  el.parentElement.style.padding = '0';
});

// 拖拽处理
const dragEl = ref<HTMLDivElement>();
const isDragging = ref(false);

function doDrag(e: MouseEvent) {
  if (!isDragging.value) {
    return;
  }

  // 获取屏幕的宽度
  const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  let newSize = screenWidth - e.clientX;

  // 限制抽屉的宽度范围
  if (newSize < 600) {
    newSize = 600;
  }
  else if (newSize > 1600) {
    newSize = 1600;
  }

  size.value = newSize;
  setSizeConfig(newSize);
}

function mousedownHandler() {
  if (!dragEl.value) {
    return;
  }

  isDragging.value = true;
  document.addEventListener('mousemove', doDrag);
}

document.addEventListener('mouseup', mouseupHandler);
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', doDrag);
  document.removeEventListener('mouseup', mouseupHandler);
});

function mouseupHandler() {
  isDragging.value = false;
  document.removeEventListener('mousemove', doDrag);
}

function openHandler() {
  client.openTimes++;
  options.onOpen?.(client.openTimes);

  if (client.openTimes > 1) {
    return;
  }

  // 首次打开抽屉时，滚动到底部
  client.proxy.postMessage({
    action: 'scrollToBottom',
    params: ['instant'],
  });
}

const drawerStyle = computed(() => {
  return {
    transition: isDragging.value ? 'none !important' : undefined,
  };
});
</script>

<template>
  <ElDrawer
    v-model="visible"
    :style="drawerStyle"
    :with-header="false"
    :size="size"
    lock-scroll
    @open="openHandler">
    <div ref="bodyEl" v-loading="loading" class="openx-chat-iframe-wrapper">
      <div ref="dragEl" class="dragger" @mousedown.prevent="mousedownHandler" />
      <div v-if="isDragging" class="iframe-cover" />
      <iframe
        ref="iframeEl"
        class="openx-chat-iframe"
        :src="options.url"
        frameborder="0"
        allow="microphone" />
    </div>
  </ElDrawer>
</template>

<style lang="scss" scoped>
.openx-chat-iframe-drawer {
  background-color: red;

  &.is-dragging {
    transition: none !important;
  }
}

.openx-chat-iframe-wrapper {
  position: relative;
  height: 100%;

  .dragger {
    position: absolute;
    top: 0;
    left: 0;
    width: 12px;
    height: 100%;
    cursor: e-resize;
    content: "";
  }

  .iframe-cover {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: transparent;
  }
}

.openx-chat-iframe {
  width: 100%;
  height: 100%;
  min-height: 700px;
  vertical-align: middle;
}
</style>
