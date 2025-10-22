<script setup lang="ts">
import { ChatApp } from '../../../modules'

const emit = defineEmits<{
  (e: 'click'): void
}>()

const app = ChatApp.use()

const operationProps = {
  isSwitch: false,
  label: '技能',
  iconClass: 'i-mdi-category',
}

const {
  editDisabled,
} = app

const {
  activeSkill,
} = app.input

const skillInfo = computed(() => {
  if (!activeSkill.value) {
    return '当前未选择任何技能'
  }
  return `当前技能：${activeSkill.value.name}`
})

function handleClick() {
  emit('click')
}
</script>

<template>
  <chat-input-menu-item id="chat-skills-select-operation">
    <chat-skills-operation-button
      v-bind="operationProps"
      :tip="skillInfo"
      :disabled="editDisabled"
      @click="handleClick" />
    <template #collapse>
      <chat-skills-operation-menu-item
        v-bind="operationProps"
        :tip="skillInfo"
        :disabled="editDisabled"
        @click="handleClick" />
    </template>
  </chat-input-menu-item>
</template>
