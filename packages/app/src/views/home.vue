<script setup lang="ts">
import logoImg from '../assets/ai-chat.png';
import { ChatApp } from '../modules';

const app = ChatApp.use();

app.nav.reset({ defaultTitleLogo: logoImg });

const {
  smSizeCss,
  wrapperEl,
  scrollerEl,
  isWrapperFitContent,
  scrollToBottomEnabled,
  isScrollerNearBottom,
} = app.nav;

function floatClickHandler() {
  app.nav.toBottom();
}
</script>

<template>
  <chat-nav-layout h="100%">
    <chat-nav />
    <template #content>
      <div class="home-wrapper">
        <chat-header flex="shrink-0" />
        <div ref="wrapperEl" class="home-content-wrapper">
          <main class="home-content-main">
            <div ref="scrollerEl" h="100%" overflow="x-hidden y-auto">
              <div class="home-content" p="x-24px" :class="{ 'is-content-fit': isWrapperFitContent }">
                <router-view v-slot="{ Component }">
                  <keep-alive :exclude="['index']">
                    <component :is="Component" :key="$route.path" />
                  </keep-alive>
                </router-view>
              </div>
            </div>

            <div v-if="scrollToBottomEnabled && !isScrollerNearBottom" class="to-bottom-btn" @click="floatClickHandler">
              <i text="24px" i="mdi-keyboard-arrow-down" c="primary" />
            </div>
          </main>

          <footer class="home-content-footer">
            <div class="home-content" p="x-12px" :class="{ 'is-content-fit': isWrapperFitContent }">
              <router-view name="footer" />
            </div>
          </footer>
        </div>
      </div>
    </template>
  </chat-nav-layout>
</template>

<style scoped lang="scss">
.home-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color-base);
}

.home-content-wrapper {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  height: 0;
}

.home-content-main {
  position: relative;
  flex-grow: 1;
  height: 0;
}

.home-content-footer {
  flex-shrink: 0;
}

.home-content {
  width: v-bind(smSizeCss);
  height: 100%;
  margin: auto;

  &.is-content-fit {
    width: 100%;
  }
}

.to-bottom-btn {
  position: absolute;
  bottom: 20px;
  left: 50%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
  background-color: var(--el-bg-color-base);
  border-radius: 50%;
  box-shadow: 0 0 4px 0 rgb(0 0 0 / 2%), 0 6px 10px 0 rgb(47 53 64 / 10%);
  transform: translateX(-50%);

  &:hover {
    box-shadow: 0 0 4px 0 rgb(0 0 0 / 2%), 0 10px 16px 0 rgb(47 53 64 / 14%);
  }
}
</style>
