<script setup lang="ts">
import { ClickOutside as vClickOutside } from 'element-plus';
import { ChatApp } from '../../modules';

defineProps<{
  visible: boolean
}>();

const emit = defineEmits<{
  (e: 'close'): void
}>();

const app = ChatApp.use();

const {
  skillSelectionWidth,
  skillSelectionQuery,
  skillsFiltered,
  activeKey,
} = app.input;

function clickOutsideHandler() {
  emit('close');
}

function clickSkillHandler(key: string) {
  emit('close');
  if (key !== activeKey.value) {
    app.input.triggerSkill(key);
  }
}
</script>

<template>
  <el-popover
    :visible="visible"
    placement="bottom"
    :width="skillSelectionWidth"
    :popper-style="{ 'padding': 0, 'border-radius': '16px' }">
    <template #reference>
      <slot />
    </template>
    <div
      v-click-outside="clickOutsideHandler"
      class="chat-skills-selections">
      <div p="12px">
        <el-input
          v-model="skillSelectionQuery"
          style="width: 100%;"
          size="large"
          placeholder="搜索技能" />
      </div>
      <ul
        max-h="226px"
        p="x-12px"
        overflow="y-auto"
        flex="~ col gap-1px">
        <li
          v-for="skill in skillsFiltered"
          :key="skill.key"
          class="chat-skills-selection-item"
          @click="clickSkillHandler(skill.key)">
          <chat-skills-icon
            font="bold"
            m="l-6px r-14px"
            flex="shrink-0"
            text="18px"
            :class="[skill.iconClass]" />
          <span
            font="bold"
            m="r-8px"
            flex="shrink-0">
            {{ skill.name }}
          </span>
          <span
            c="secondary"
            text="14px"
            flex="grow-1"
            w="0"
            truncate>
            {{ skill.description }}
          </span>
          <i
            v-if="skill.key === activeKey"
            i="mdi-check"
            flex="shrink-0"
            text="16px"
            c="primary" />
        </li>
        <li
          v-if="!skillsFiltered.length"
          bg="page"
          rounded="10px"
          h="40px"
          flex="~ items-center justify-center"
          c="secondary"
          m="l-4px">
          无匹配技能
        </li>
      </ul>
    </div>
  </el-popover>
</template>

<style scoped lang="scss">
.chat-skills-selections {
  position: relative;
  padding-bottom: 8px;
}

:deep(.el-input) {
  .el-input__wrapper {
    padding: 4px 12px;
    font-size: 16px;
    border-radius: 12px;
  }
}

.chat-skills-selection-item {
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
