<script setup lang="ts">
import { useMarkdownProcessor } from './markdown';

const props = withDefaults(defineProps<{
  value?: string
}>(), {
  value: '',
});

const { processor, slugger } = useMarkdownProcessor();

const MarkdownComp = ref<VNode>();

watch([
  () => props.value,
  processor,
], ([value, processor]) => {
  if (!processor) {
    return;
  }

  slugger.value?.reset();
  processor.process(value).then((res) => {
    MarkdownComp.value = res.result as VNode;
  });
}, { immediate: true });
</script>

<template>
  <div v-if="value" class="markdown-body">
    <component :is="MarkdownComp" v-if="MarkdownComp" />
  </div>
</template>

<style scoped lang="scss">
.markdown-body {
  font-size: 16px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  word-break: break-word;

  & > :last-child {
    margin-bottom: 0;
  }

  /** 引用 */
  :deep(blockquote),
  :deep(think) {
    display: block;
    padding-left: 10px;
    margin: 0;
    margin-bottom: 16px;
    line-height: 28px;
    color: var(--el-text-color-secondary);
    border-left: 2px solid var(--el-border-color);
  }

  /** 代码 */
  :deep(code) {
    background-color: rgb(0 0 0 / 6%);
    border-radius: 4px;
  }

  /** 段落 */
  :deep(p) {
    margin-bottom: 16px;
    line-height: 28px;
  }

  :deep(hr) {
    margin: 16px 0;
  }

  // 解决回答中带有数学公式，页面样式漂移问题
  :deep(.katex) {
    position: relative;
  }
}
</style>
