<script setup lang="ts">
import type { ElTooltipProps, PopoverProps } from 'element-plus';

withDefaults(defineProps<{
  /** 弹出层类型 */
  type?: 'popover' | 'tooltip'

  /** tip 明文字 */
  tipContent?: string

  /** tip 出现位置 */
  tipPlace?: ElTooltipProps['placement']

  trigger?: PopoverProps['trigger']

  /**  */
  popoverOptions?: Partial<PopoverProps>

  iconClass?: string

  iconStyle?: Record<string, any>

  /** 容器整体尺寸 */
  totalSize?: string

  /** icon 尺寸 */
  iconSize?: string

  /** icon padding 尺寸 */
  iconHoverPadding?: string

  /** icon hover 圆角大小 */
  iconHoverRadius?: string

  /** icon hover 背景色 */
  iconHoverColor?: string
}>(), {
  type: 'tooltip',
  tipContent: '',
  tipPlace: 'bottom',
  trigger: 'hover',
  popoverOptions: () => ({}),
  iconClass: '',
  iconStyle: () => ({}),
  totalSize: '32px',
  iconSize: '18px',
  iconHoverPadding: '7px',
  iconHoverRadius: '10px',
  iconHoverColor: 'var(--el-bg-color-page)',
});

const buttonRef = ref<HTMLElement>();
</script>

<template>
  <el-tooltip
    v-if="type === 'tooltip'"
    effect="dark"
    :content="tipContent"
    :placement="tipPlace"
    :hide-after="0"
    :trigger="trigger"
    virtual-triggering
    :virtual-ref="buttonRef" />
  <el-popover
    v-else
    virtual-triggering
    :virtual-ref="buttonRef"
    placement="bottom-start"
    :trigger="trigger"
    v-bind="popoverOptions">
    <slot />
  </el-popover>
  <div ref="buttonRef" class="icon-operation" v-bind="$attrs">
    <i
      class="icon-operation-icon"
      :class="[iconClass]"
      :style="iconStyle" />
  </div>
</template>

<style scoped lang="scss">
.icon-operation {
  width: v-bind(totalSize);
  height: v-bind(totalSize);
  padding: v-bind(iconHoverPadding);
  font-size: v-bind(iconSize);
  color: var(--el-text-color-primary);
  cursor: pointer;
  border-radius: v-bind(iconHoverRadius);

  &:hover {
    background-color: v-bind(iconHoverColor);
  }
}

.icon-operation-icon {
  vertical-align: top;
}
</style>
