<script setup lang="ts">
import type { ChatFlowItem } from '@app/modules';
import useClipboard from 'vue-clipboard3';
import { ChatApp, CODEHUB_ISSUE_URL } from '../../modules';

const props = withDefaults(defineProps<{
  /** 聊天对象 */
  chat: ChatFlowItem
}>(), {});

const app = ChatApp.use();
const {
  activeChatFlow,
} = app;

const { toClipboard } = useClipboard();
function copyClickHandler() {
  toClipboard(props.chat.content.value).then(
    () => { ElMessage.success('复制成功'); },
    () => { ElMessage.error('复制失败'); },
  );
}

const hasNodes = computed(() => Boolean(props.chat.nodes.value.length));

const wrapperEl = ref<HTMLDivElement>();
const { isOutside } = useMouseInElement(wrapperEl);

const isOperationsShow = computed(() => {
  if (props.chat.isRunning.value) {
    return false;
  }
  if (props.chat.isLast.value) {
    return true;
  }
  return !isOutside.value;
});

const iconProps = {
  totalSize: '24px',
  iconSize: '16px',
  iconHoverPadding: '4px',
  iconHoverRadius: '4px',
  tipPlace: 'top',
};

const likeShow = computed(() => props.chat.messageId.value && props.chat.rating.value !== 'dislike');
const likeTip = computed(() => props.chat.rating.value === 'like' ? '取消点赞' : '点赞');
const likeClass = computed(() => {
  if (props.chat.rating.value === 'like') {
    return 'i-mdi-thumb-up c-primary';
  }
  return !props.chat.rating.value ? 'i-mdi-thumb-up-outline c-regular' : '';
});

const dislikeShow = computed(() => props.chat.messageId.value && props.chat.rating.value !== 'like');
const dislikeTip = computed(() => props.chat.rating.value === 'dislike' ? '取消点踩' : '点踩');
const dislikeClass = computed(() => {
  if (props.chat.rating.value === 'dislike') {
    return 'i-mdi-thumb-down c-primary';
  }
  return !props.chat.rating.value ? 'i-mdi-thumb-down-outline c-regular' : '';
});

function likeHandler(like: boolean) {
  const likeState = like ? 'like' : 'dislike';

  /** 若有点赞 / 点踩状态，则应该取消点赞 */
  const rating = props.chat.rating.value ? null : likeState;

  props.chat.feedback(rating).then(() => {
    ElMessage.success('操作成功');
  }).catch((e) => {
    ElNotification.error({
      title: '操作失败',
      message: e.message,
    });
  });
}

const W3_URL = 'https://w3.huawei.com/unisearch/index.html';
function w3SearchUrl() {
  if (!activeChatFlow.value) {
    return W3_URL;
  }

  const items = activeChatFlow.value.items;
  const index = items.findIndex(c => c === props.chat);
  for (let i = index; i >= 0; i--) {
    if (items[i].role === 'user') {
      return `${W3_URL}?keyword=${encodeURIComponent(items[i].content.value)}`;
    }
  }
  return W3_URL;
}

function stopHandler() {
  props.chat.stop();
}
</script>

<template>
  <div ref="wrapperEl" class="chat-assistant-item">
    <chat-loading
      v-if="hasNodes"
      :nodes="chat.nodes.value"
      m="b-16px" />
    <i
      v-if="chat.isRunning.value && !chat.content.value"
      i="ep-loading"
      class="el-icon is-loading" />
    <chat-markdown :value="chat.content.value" />
    <div h="40px" m="t-8px">
      <div v-if="isOperationsShow" flex="~ items-center gap-12px" h="100%">
        <icon-operation
          v-bind="iconProps"
          icon-class="i-mdi-content-copy text-regular"
          tip-content="复制"
          @click="copyClickHandler" />
        <icon-operation
          type="popover"
          v-bind="iconProps"
          icon-class="i-mdi-question-mark-circle-outline text-regular"
          :popover-options="{ width: '280px' }">
          <div>
            <p font="bold">
              回答内容不理想？您可以：
            </p>
            <ul class="help-list">
              <li v-if="chat.type === 'chat-flow'">
                <img m="t--4px r-4px" src="@app/assets/w3next.png"><a
                  class="link"
                  target="_blank"
                  data-uem-name="AI问答助手-W3搜索"
                  :href="w3SearchUrl()">W3 搜一搜</a>
              </li>
              <li>
                向 OpenX 反馈问题：<a
                  class="link"
                  target="_blank"
                  data-uem-name="AI问答助手-反馈问题"
                  :href="CODEHUB_ISSUE_URL">
                  点此提issue
                </a>
              </li>
            </ul>
          </div>
        </icon-operation>
        <icon-operation
          v-if="likeShow"
          v-bind="iconProps"
          :icon-class="likeClass"
          :tip-content="likeTip"
          @click="likeHandler(true)" />
        <icon-operation
          v-if="dislikeShow"
          v-bind="iconProps"
          :icon-class="dislikeClass"
          :tip-content="dislikeTip"
          @click="likeHandler(false)" />
      </div>
      <div v-if="chat.isRunning.value" h="100%" flex="~ items-center justify-center">
        <el-button
          v-if="chat.isFlowRunning.value"
          round
          @click="stopHandler">
          <i i="mdi-stop-circle-outline" text="18px" m="r-4px" />
          停止回答
        </el-button>
        <el-button
          v-else
          round
          disabled>
          <i
            class="el-icon is-loading"
            i="ep-loading"
            text="18px"
            m="r-4px" />
          停止中...
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.help-list {
  padding-left: 16px;

  li {
    margin-top: 6px;
    list-style: disc;
  }

  .link {
    color: var(--el-color-info);
    cursor: pointer;
  }
}
</style>
