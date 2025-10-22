<script setup lang="ts">
import type { ChatFlowItem } from '@app/modules';

withDefaults(defineProps<{
  /** 聊天对象 */
  chat: ChatFlowItem
}>(), {});
</script>

<template>
  <chat-user-item v-if="chat.role === 'user'" :chat="chat" v-bind="$attrs" />
  <chat-assistant-item v-else :chat="chat" v-bind="$attrs" />
</template>
