<script setup lang="ts">
import { ChatApp } from '../../../modules'

const app = ChatApp.use()

const operationProps = {
  isSwitch: true,
  label: 'W3 搜索',
  iconClass: 'i-mdi-global-search',
  tip: '整合 W3 搜索的内源相关内容回答问题',
}

const {
  isChat,
} = app

const {
  params,
} = app.input
</script>

<template>
  <chat-input-menu-item v-if="!isChat" id="chat-search-switch">
    <chat-skills-operation-button
      v-bind="operationProps"
      v-model="params.search"
      :disabled="isChat" />
    <template #collapse>
      <chat-skills-operation-menu-item
        v-bind="operationProps"
        v-model="params.search"
        :disabled="isChat" />
    </template>
  </chat-input-menu-item>
</template>
