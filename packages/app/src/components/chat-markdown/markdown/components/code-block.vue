<script setup lang="ts">
import useClipboard from 'vue-clipboard3';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<{
  code?: string
  lang?: string
}>(), {
  code: '',
  lang: '',
});

const collapse = ref(false);

const { toClipboard } = useClipboard();
function copyClickHandler() {
  toClipboard(props.code).then(
    () => { ElMessage.success('复制成功'); },
    () => { ElMessage.error('复制失败'); },
  );
}
</script>

<template>
  <div class="code-block">
    <div class="code-block-header">
      <el-tooltip effect="dark" :content="collapse ? '展开代码块' : '收起代码块'" placement="top">
        <div class="code-block-header-lang" flex="~ items-center" @click="collapse = !collapse">
          <span text="14px">{{ lang }}</span>
          <i
            v-if="!collapse"
            i="mdi-keyboard-arrow-up"
            text="20px"
            c="secondary" />
          <i
            v-else
            i="mdi-keyboard-arrow-down"
            text="20px"
            c="secondary" />
        </div>
      </el-tooltip>

      <div flex="~ items-center gap-8px">
        <icon-operation
          icon-class="i-mdi-content-copy text-regular"
          icon-hover-color="rgba(0, 0, 0, 0.06)"
          icon-hover-padding="3px"
          icon-hover-radius="4px"
          total-size="20px"
          icon-size="14px"
          tip-content="复制代码"
          tip-place="top"
          @click="copyClickHandler" />
      </div>
    </div>
    <div v-show="!collapse" class="code-block-body" v-bind="$attrs">
      <!-- 这个 <slot> 千万不要换行，避免错误的缩进格式 -->
      <pre><slot /></pre>
    </div>
  </div>
</template>

<style scoped lang="scss">
.code-block {
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}

.code-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px;
  background-color: #f3f4f6;
}

.code-block-header-lang {
  display: flex;
  align-items: center;
  padding: 0 4px 0 8px;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: rgb(0 0 0 / 6%);
  }
}

.code-block-body {
  padding: 12px 16px 16px;
  overflow-x: auto;
  font-size: 13px;
  background-color: #f9fafb !important;

  :deep(code) {
    background-color: inherit !important;
  }
}
</style>
