<script setup lang="ts">
import { debounce } from 'lodash-es';
import { ChatApp } from '../../modules';

const app = ChatApp.use();
const {
  activeChatFlow,
} = app;

const {
  query,
  inputWrapperEl,
  skillSelectionQuery,
  leftOperations: LeftOperations,
  activeSkill,
} = app.input;

const placeholderTxt = computed(() => `${activeSkill.value?.description}\n输入 @ 选择技能`);

const editState = computed(() => {
  if (!activeChatFlow.value) {
    return 'editable';
  }

  return activeChatFlow.value.editState.value;
});

function chatHandler() {
  if (!query.value.trim()) {
    ElMessage.warning('请输入内容');
    return;
  }

  app.input.sendChatMessage();
}

function stopHandler() {
  activeChatFlow.value?.runningItem.value?.stop();
}

const skillsSelectionVisible = ref(false);

/** 展示/隐藏技能选择框 */
const showSkillSelection = debounce((value: boolean = true) => {
  if (value) {
    skillsSelectionVisible.value = true;
    skillSelectionQuery.value = '';
  }
  else {
    skillsSelectionVisible.value = false;
  }
}, 100);

function toggleSkillSelection() {
  showSkillSelection(!skillsSelectionVisible.value);
}

function handleSkillSelectButtonClick() {
  toggleSkillSelection();
}

onMounted(() => {
  app.input.on('onShowSkillSelection', showSkillSelection);
});

onBeforeUnmount(() => {
  app.input.off('onShowSkillSelection', showSkillSelection);
});
</script>

<template>
  <chat-skills-selections :visible="skillsSelectionVisible" @close="showSkillSelection(false)">
    <div ref="inputWrapperEl" class="chat-input" v-bind="$attrs">
      <el-input
        v-model="query"
        flex="grow"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 6 }"
        size="large"
        text="16px"
        :placeholder="placeholderTxt"
        @keyup.enter.exact="chatHandler" />
      <div class="chat-input-operations">
        <chat-input-menu flex="1">
          <chat-skills-select-operation @click="handleSkillSelectButtonClick" />
          <LeftOperations v-if="LeftOperations" />
        </chat-input-menu>
        <div class="chat-input-operations-right">
          <div bg="light" w="1px" h="20px" />
          <el-tooltip v-if="editState !== 'stop'" effect="dark" placement="top">
            <el-button
              v-track
              type="primary"
              data-uem-name="AI问答助手-提问"
              circle
              :loading="editState === 'loading'"
              class="text-18px [&_.el-icon.is-loading]:left-3px"
              @click="chatHandler">
              <i v-if="editState === 'editable'" i="mdi-arrow-up" />
            </el-button>
            <template #content>
              <p>发送：Enter</p>
              <p>换行：Shift + Enter</p>
            </template>
          </el-tooltip>
          <icon-operation
            v-else
            icon-class="i-mdi-stop-circle-outline"
            icon-hover-padding="4px"
            icon-hover-radius="4px"
            total-size="32px"
            icon-size="24px"
            tip-content="停止回答"
            tip-place="top"
            @click="stopHandler" />
        </div>
      </div>
    </div>
  </chat-skills-selections>
</template>

<style scoped lang="scss">
.chat-input {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 20px;
}

.chat-input-operations {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.chat-input-operations-right {
  display: flex;
  flex-shrink: 0;
  gap: 12px;
  align-items: center;
  margin-left: 16px;
}

:deep(.el-textarea) {
  .el-textarea__inner {
    padding: 0;
    resize: none;
    box-shadow: none;
  }
}
</style>
