<script setup lang="ts">
import { ChatApp, CODEHUB_ISSUE_URL } from '@app/modules';

const app = ChatApp.use();
const {
  route,
  router,
  activeChatFlow,
} = app;

const {
  bottomEl,
  contentEl,
} = app.nav;

const id = computed(() => String(route.params.id));

onActivated(() => {
  nextTick(() => {
    app.nav.toBottom('instant');
  });
});

// 建议问题
const suggestedQuestions = computed(() => {
  if (!activeChatFlow.value) {
    return [];
  }
  return activeChatFlow.value.suggestedQuestions.value;
});

function questionClickHandler(query: string) {
  if (!activeChatFlow.value) {
    return;
  }
  activeChatFlow.value.chat(query).catch((e) => {
    if (e instanceof Error && e.isStreamStopped) {
      return;
    }

    ElNotification.error({
      title: '大模型算力不足，问答请求出现错误',
      message: e.message,
    });
  });
}
</script>

<template>
  <div v-if="activeChatFlow" ref="contentEl" p="t-16px">
    <chat-item
      v-for="(chat, index) in activeChatFlow.historyItems.value"
      :key="index"
      :chat="chat" />
    <chat-item
      v-for="(chat, index) in activeChatFlow.currentItems.value"
      :key="index"
      :chat="chat" />

    <div
      v-if="!activeChatFlow.isRunning.value && suggestedQuestions.length"
      flex="~ col items-start gap-8px"
      m="t-24px">
      <div
        v-for="(question, index) in suggestedQuestions"
        :key="index"
        v-track
        bg="page hover:[rgba(0,0,0,0.06)]"
        p="x-16px y-8px"
        rounded="12px"
        cursor="pointer"
        c="header"
        data-uem-name="AI问答助手-推荐提问"
        @click="questionClickHandler(question)">
        {{ question }}
        <i i="mdi-arrow-right" text="16px" />
      </div>
    </div>

    <div ref="bottomEl" h="32px" />
  </div>
</template>

<style scoped lang="scss">
</style>
