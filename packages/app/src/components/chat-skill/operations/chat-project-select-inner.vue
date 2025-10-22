<script setup lang="ts">
import defaultImg from '@app/assets/openx.png';
import { useProjectSelect } from '../composables';

const {
  params,
  query,
  projectList,
  projectSelectHandler,
} = useProjectSelect();
</script>

<template>
  <div p="b-8px">
    <div p="12px">
      <el-input
        v-model="query"
        style="width: 100%;"
        placeholder="输入关键字搜索项目" />
    </div>
    <ul
      p="x-12px"
      overflow="y-auto"
      flex="~ col gap-1px"
      max-h="250px">
      <li
        v-for="p in projectList"
        :key="p.id"
        class="chat-project-selection-item"
        @click="projectSelectHandler(p)">
        <user-avatar :src="p.logo" :default-src="defaultImg" size="24px" />
        <span
          flex="grow-1"
          w="0"
          m="l-4px"
          truncate>
          {{ p.name }}
        </span>
        <i
          v-if="p.id === params.belongingId"
          i="mdi-check"
          flex="shrink-0"
          text="16px"
          c="primary"
          m="l-4px" />
      </li>
      <li
        v-if="!projectList.length"
        bg="page"
        rounded="10px"
        h="32px"
        flex="~ items-center justify-center"
        c="secondary">
        无匹配项目
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.chat-project-selection-item {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  height: 40px;
  padding: 6px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  border-radius: 10px;

  &:hover {
    background-color: var(--el-bg-color-page);
  }
}
</style>
