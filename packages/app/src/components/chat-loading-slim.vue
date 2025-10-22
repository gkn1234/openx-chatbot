<script setup lang="ts">
import type { ChatFlowNode } from '../modules'

const props = withDefaults(defineProps<{
  nodes?: ChatFlowNode[]
}>(), {
  nodes: () => [],
})

const lastNode = computed(() => props.nodes[props.nodes.length - 1])
</script>

<template>
  <div flex="~ items-center gap-4px">
    <i
      text="18px"
      class="i-ep-loading el-icon is-loading" />
    <span>{{ lastNode.name }}</span>
  </div>
</template>
