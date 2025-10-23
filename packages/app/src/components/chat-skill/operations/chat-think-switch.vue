<script setup lang="ts">
import { ChatApp } from '../../../modules';

const app = ChatApp.use();

const operationProps = {
  isSwitch: true,
  label: '深度思考',
  iconClass: 'i-mdi-think-outline',
  tip: '使用推理模型，输出深度思考过程',
};

const {
  isChat,
} = app;

const {
  params,
} = app.input;
</script>

<template>
  <chat-input-menu-item v-if="!isChat" id="chat-think-switch">
    <chat-skills-operation-button
      v-bind="operationProps"
      v-model="params.think"
      :disabled="isChat" />
    <template #collapse>
      <chat-skills-operation-menu-item
        v-bind="operationProps"
        v-model="params.think"
        :disabled="isChat" />
    </template>
  </chat-input-menu-item>
</template>
