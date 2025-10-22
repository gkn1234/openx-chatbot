<script setup lang="ts">
import type { ChatSkillsOperationButtonProps } from '../types';
import defaultImg from '@app/assets/openx.png';
import { ChatApp } from '@app/modules';
import { template } from '@openx/utils';
import { setupProjectSelect } from '../composables';

const props = withDefaults(defineProps<{
  tipTemplate?: string
}>(), {
  tipTemplate: '向内源项目 <%= project %> 提问，点击切换项目',
});

const app = ChatApp.use();

const {
  isChat,
} = app;

const {
  params,
} = app.input;

const operationProps: ChatSkillsOperationButtonProps = {
  type: 'both',
  popoverOptions: {
    width: '250px',
    popperStyle: {
      'padding': 0,
      'border-radius': '16px',
    },
  },
};

const {
  isProjectAvailable,
  buttonRef,
  menuItemRef,
} = setupProjectSelect();

const tipText = computed(() => {
  if (!isProjectAvailable.value) {
    return '未选取有效项目，点击切换项目';
  }

  const compiled = template(props.tipTemplate);
  return compiled({ project: params.value.belongingName });
});
</script>

<template>
  <chat-input-menu-item v-if="!isChat" id="chat-search-switch">
    <chat-skills-operation-button
      ref="buttonRef"
      v-bind="operationProps"
      :label="params.belongingName"
      :tip="tipText">
      <template #icon>
        <user-avatar :src="params.belongingLogo" :default-src="defaultImg" size="24px" />
      </template>
      <chat-project-select-inner />
    </chat-skills-operation-button>
    <template #collapse>
      <chat-skills-operation-menu-item
        ref="menuItemRef"
        v-bind="operationProps"
        :label="params.belongingName"
        :tip="tipText">
        <template #icon>
          <user-avatar :src="params.belongingLogo" :default-src="defaultImg" size="24px" />
        </template>
        <chat-project-select-inner />
      </chat-skills-operation-menu-item>
    </template>
  </chat-input-menu-item>
</template>
