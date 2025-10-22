<script setup lang="ts">
import type { PopoverInstance } from 'element-plus'
import type { ChatSkillsOperationButtonProps } from './types'

const props = withDefaults(defineProps<ChatSkillsOperationButtonProps>(), {
  isSwitch: false,
  iconClass: '',
  label: '',
  tip: '',
  type: 'tooltip',
  disabled: false,
  popoverOptions: () => ({}),
})

const emit = defineEmits(['click'])

const modelValue = defineModel({ required: false, default: false })
const menuRef = ref()

function clickHandler() {
  if (props.disabled) {
    return
  }

  modelValue.value = !modelValue.value
  emit('click')
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
    :virtual-ref="menuRef" />
  <el-popover
    v-if="type === 'popover' || type === 'both'"
    ref="popoverRef"
    virtual-triggering
    :virtual-ref="menuRef"
    placement="right-start"
    trigger="click"
    v-bind="popoverOptions">
    <slot />
  </el-popover>
  <li
    ref="menuRef"
    class="chat-skills-operation-menu-item"
    :class="{
      'is-active': isSwitch ? modelValue : false,
      'is-disabled': disabled,
    }"
    v-bind="$attrs"
    @click="clickHandler">
    <slot v-if="$slots.icon" name="icon" />
    <chat-skills-icon v-else :class="[iconClass]" />
    <span m="l-12px">{{ label }}</span>
  </li>
</template>

<style scoped lang="scss">
.chat-skills-operation-menu-item {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  border-radius: 10px;

  &:hover {
    background-color: var(--el-bg-color-page);
  }

  &.is-disabled {
    color: var(--el-disabled-text-color);
    cursor: not-allowed;

    &:hover {
      background-color: var(--el-bg-color-base);
    }
  }

  &.is-active {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);

    &:hover {
      background-color: var(--el-color-primary-light-9);
    }
  }
}
</style>
