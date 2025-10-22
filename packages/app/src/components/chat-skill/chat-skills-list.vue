<script setup lang="ts">
import { ChatApp } from '../../modules';

const app = ChatApp.use();

const {
  activeKey,
  skills,
} = app.input;

function clickSkillHandler(key: string) {
  if (key !== activeKey.value) {
    app.input.triggerSkill(key);
  }
}
</script>

<template>
  <div class="chat-skills-list">
    <el-button
      v-for="skill in skills"
      :key="skill.key"
      class="chat-skill-button"
      size="large"
      round
      @click="clickSkillHandler(skill.key)">
      <chat-skills-icon
        font="bold"
        m="r-8px"
        flex="shrink-0"
        text="18px"
        :style="{ color: skill.iconColor }"
        :class="[skill.iconClass]" />
      <span>{{ skill.name }}</span>
    </el-button>
  </div>
</template>

<style scoped lang="scss">
.chat-skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.chat-skill-button {
  padding: 10px 12px;
  color: var(--el-text-color-primary);
  border-color: var(--el-border-color-lighter);

  &:hover {
    background-color: var(--el-bg-color-page);
  }
}
</style>
