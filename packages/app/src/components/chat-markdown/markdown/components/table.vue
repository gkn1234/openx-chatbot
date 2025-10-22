<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});
</script>

<template>
  <div class="table-wrapper">
    <table v-bind="$attrs">
      <slot />
    </table>
  </div>
</template>

<style scoped lang="scss">
.table-wrapper {
  width: fit-content;
  max-width: 100%;
  margin-bottom: 16px;
  overflow: auto;
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;

  :deep(table) {
    display: block;
    width: max-content;
    max-width: max-content;
    overflow: auto;
    text-align: left;
    border-spacing: 0;
    border-collapse: collapse;

    tr {
      border-top: 1px solid var(--el-border-color-light);
    }

    thead {
      tr {
        &:first-child {
          background-color: var(--el-bg-color-page);
          border-top: 0;
        }
      }
    }

    th {
      font-weight: 600;
    }

    th,
    td {
      max-width: 448px;
      padding: 12px 18px;
      color: var(--el-text-color-primary);
      border: 0;
      border-right: 1px solid var(--el-border-color-light);

      &:last-child {
        border-right: 0;
      }
    }
  }
}
</style>
