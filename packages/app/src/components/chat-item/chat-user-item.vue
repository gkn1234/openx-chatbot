<script setup lang="ts">
import type { ChatFlowItem } from '@app/modules'
import useClipboard from 'vue-clipboard3'

const props = withDefaults(defineProps<{
  /** 聊天对象 */
  chat: ChatFlowItem
}>(), {})

const { toClipboard } = useClipboard()
function copyClickHandler() {
  toClipboard(props.chat.content.value).then(
    () => { ElMessage.success('复制成功') },
    () => { ElMessage.error('复制失败') },
  )
}

const wrapperEl = ref<HTMLDivElement>()
const { isOutside } = useMouseInElement(wrapperEl)
</script>

<template>
  <div ref="wrapperEl" class="chat-user-item">
    <div flex="~ justify-end">
      <chat-markdown class="chat-user-content" :value="chat.content.value" />
    </div>
    <div h="40px">
      <div v-if="!isOutside" flex="~ justify-end items-center" h="100%">
        <icon-operation
          icon-class="i-mdi-content-copy text-regular"
          icon-hover-padding="4px"
          icon-hover-radius="4px"
          total-size="24px"
          icon-size="16px"
          tip-content="复制"
          tip-place="top"
          @click="copyClickHandler" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-user-content {
  padding: 8px 16px;
  background-color: var(--el-bg-color-page);
  border-radius: 12px;
}
</style>
