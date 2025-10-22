<script setup lang="ts">
import { ChatApp } from '../../modules'

withDefaults(defineProps<{
  logoSize?: string
  textSize?: string
}>(), {
  logoSize: '36px',
  textSize: '16px',
})

const app = ChatApp.use()
const {
  titleLogo,
  titleTag,
  titleText,
} = app.nav

function clickHandler() {
  app.toHome()
}
</script>

<template>
  <div
    flex="~ items-center shrink-0">
    <img
      class="chat-nav-title-logo"
      :src="titleLogo"
      cursor="pointer"
      @click="clickHandler">
    <span
      m="l-8px"
      font="bold"
      cursor="pointer"
      class="chat-nav-title-text"
      @click="clickHandler">{{ titleText }}</span>
    <span
      v-if="titleTag"
      bg="primary"
      c="white"
      m="l-8px"
      leading="24px"
      p="x-6px"
      rounded="12px">{{ titleTag }}</span>
  </div>
</template>

<style lang="scss" scoped>
.chat-nav-title-logo {
  width: v-bind(logoSize);
  height: v-bind(logoSize);
}

.chat-nav-title-text {
  font-size: v-bind(textSize);
}
</style>
