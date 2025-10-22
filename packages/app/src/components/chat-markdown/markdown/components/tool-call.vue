<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

withDefaults(defineProps<{
  name?: string
  label?: string
  params?: Record<string, any>
  resultState?: 'running' | 'success' | 'failed'
  resultContent?: string
}>(), {
  name: '',
  label: '',
  params: () => ({}),
  resultState: 'running',
  resultContent: '',
});

const activeNames = ref([]);
</script>

<template>
  <el-collapse v-model="activeNames" class="tool-call">
    <el-collapse-item title="Consistency" name="1">
      <template #title>
        <div flex="~ items-center">
          <i
            v-if="resultState === 'running'"
            i="ep-loading"
            m="r-4px"
            text="18px"
            class="el-icon is-loading" />
          <i
            v-if="resultState === 'success'"
            i="ep-success-filled"
            m="r-4px"
            text="18px"
            c="success" />
          <i
            v-if="resultState === 'failed'"
            i="ep-circle-close-filled"
            m="r-4px"
            text="18px"
            c="danger" />
          <i i="mdi-hammer-screwdriver" m="r-4px" text="18px" />
          使用工具：{{ label }}
        </div>
      </template>
      <div class="tool-call-section">
        <h5>参数</h5>
        <div>{{ JSON.stringify(params) }}</div>
      </div>
      <div class="tool-call-section">
        <h5>响应</h5>
        <div>{{ resultContent }}</div>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<style scoped lang="scss">
.tool-call {
  margin-bottom: 16px;
  overflow: hidden;
  border-radius: 16px;

  :deep(.el-collapse-item__header) {
    --el-collapse-header-height: 36px;

    padding-right: 16px;
    padding-left: 16px;
    font-size: 14px;
    background-color: var(--el-fill-color-darker);
    border-bottom: 0;
  }

  :deep(.el-collapse-item__content) {
    padding: 8px 12px;
    background-color: var(--el-fill-color-darker);
  }
}

.tool-call-section {
  padding: 8px 12px;
  margin-bottom: 16px;
  color: var(--el-text-color-regular);
  background-color: var(--el-color-white);
  border-radius: 16px;
}
</style>
