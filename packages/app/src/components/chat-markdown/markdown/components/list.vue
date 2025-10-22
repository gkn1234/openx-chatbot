<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<{
  isOl?: boolean
}>(), {
  isOl: false,
});

const tagName = computed(() => props.isOl ? 'ol' : 'ul');
</script>

<template>
  <component
    :is="tagName"
    v-bind="$attrs">
    <slot />
  </component>
</template>

<style scoped lang="scss">
ul,
ol {
  padding-left: 20px;
  margin-top: 8px;
  margin-bottom: 16px;

  :deep(ul) {
    padding-left: 20px !important;
  }

  & > :deep(li) {
    list-style-type: disc;

    ul {
      margin-top: 4px;
      margin-bottom: 4px;

      li {
        margin-top: 4px;
        list-style-type: circle;
      }
    }
  }
}

.contains-task-list {
  padding-left: 0;

  :deep(li) {
    list-style-type: none;
  }

  :deep(input[type="checkbox"]) {
    width: 1em;
    height: 1em;
    vertical-align: middle;
    appearance: none;
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;

    &:checked {
      background-color: var(--el-color-primary);
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23fff' viewBox='0 0 16 16'%3E%3Cpath d='M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: 50%;
      background-size: 100% 100%;
      border-color: transparent;
    }
  }
}

:deep(li) {
  padding-left: 4px;
  margin-top: 8px;
  line-height: 28px;

  &::marker {
    color: var(--el-text-color-secondary);
  }
}

ol {
  :deep(li) {
    list-style-type: decimal;
  }
}
</style>
