<script setup lang="ts">
import type { PopoverInstance } from 'element-plus'
import type { ChatSkillsOperationButtonProps } from './types'

withDefaults(defineProps<ChatSkillsOperationButtonProps>(), {
  isSwitch: false,
  iconClass: '',
  label: '',
  tip: '',
  type: 'tooltip',
  disabled: false,
  popoverOptions: () => ({}),
})

const modelValue = defineModel({ required: false, default: false })
const buttonRef = ref()

function clickHandler() {
  modelValue.value = !modelValue.value
}

const popoverRef = ref<PopoverInstance>()
function hidePopover() {
  popoverRef.value?.hide()
}

defineExpose({
  hidePopover,
})
</script>

<template>
  <el-tooltip
    v-if="type === 'tooltip' || type === 'both'"
    effect="dark"
    :content="tip"
    placement="top"
    :hide-after="0"
    virtual-triggering
    :virtual-ref="buttonRef" />
  <el-popover
    v-if="type === 'popover' || type === 'both'"
    ref="popoverRef"
    virtual-triggering
    :virtual-ref="buttonRef"
    placement="bottom-start"
    trigger="click"
    v-bind="popoverOptions">
    <slot />
  </el-popover>
  <el-button
    ref="buttonRef"
    v-bind="$attrs"
    class="chat-skills-operation-button"
    :class="{ 'is-active': isSwitch ? modelValue : false }"
    :disabled="disabled"
    @click="clickHandler">
    <slot v-if="$slots.icon" name="icon" />
    <chat-skills-icon v-else text="18px" :class="[iconClass]" />
    <span m="l-4px">{{ label }}</span>
  </el-button>
</template>

<style scoped lang="scss">
.chat-skills-operation-button {
  height: 36px;
  color: var(--el-text-color-primary);
  border-color: var(--el-border-color-lighter);
  border-radius: 10px;

  &.is-disabled {
    color: var(--el-button-disabled-text-color);

    &:hover {
      background-color: var(--el-button-disabled-bg-color);
    }
  }

  &:hover {
    background-color: var(--el-bg-color-page);
  }

  &.is-active {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);

    &:hover {
      background-color: var(--el-color-primary-light-9);
    }
  }
}
</style>
