<script setup lang="ts">
import type { ChatFlowNode } from '../modules';

const props = withDefaults(defineProps<{
  nodes?: ChatFlowNode[]
}>(), {
  nodes: () => [],
});

const lastNode = computed(() => props.nodes[props.nodes.length - 1]);

function fixDuration(duration: number) {
  if (duration < 0.01) {
    return `${(duration * 1000).toFixed(2)}ms`;
  }
  return `${duration.toFixed(2)}s`;
}
</script>

<template>
  <el-collapse class="chat-loading" accordion>
    <el-collapse-item name="1">
      <template #title>
        <div flex="~ items-center gap-4px">
          <i
            text="18px"
            :class="{
              'i-ep-loading el-icon is-loading': lastNode.status === 'running',
              'i-ep-success-filled c-success': lastNode.status === 'succeeded',
              'i-ep-circle-close-filled c-danger': lastNode.status === 'failed' || lastNode.status === 'stopped',
            }" />
          <span>{{ lastNode.name }}</span>
        </div>
      </template>
      <ul flex="~ col gap-4px">
        <li v-for="(item, index) in nodes" :key="index" flex="~ items-center justify-between">
          <div flex="~ items-center gap-4px">
            <i
              text="18px"
              :class="{
                'i-ep-loading el-icon is-loading': item.status === 'running',
                'i-ep-success-filled c-success': item.status === 'succeeded',
                'i-ep-circle-close-filled c-danger': item.status === 'failed' || lastNode.status === 'stopped',
              }" />
            <span>{{ item.name }}</span>
          </div>
          <span v-if="item.status === 'running'">执行中</span>
          <span v-else-if="item.status === 'failed'">失败</span>
          <span v-else-if="item.status === 'stopped'">已终止</span>
          <span v-else>{{ fixDuration(item.duration) }}</span>
        </li>
      </ul>
    </el-collapse-item>
  </el-collapse>
</template>

<style scoped lang="scss">
.chat-loading {
  :deep(.el-collapse-item__header) {
    height: 36px;
    line-height: 36px;
  }

  :deep(.el-collapse-item__content) {
    padding-bottom: 8px;
  }
}
</style>
