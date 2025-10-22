<script setup lang="ts">
import { ChatApp } from '../../modules'

const app = ChatApp.use()
const {
  userName,
} = app

const time = ref(getTimeOfDay())

function getTimeOfDay() {
  const currentHour = new Date().getHours()

  if (currentHour >= 6 && currentHour < 12) {
    return '早上'
  }
  else if (currentHour >= 12 && currentHour < 14) {
    return '中午'
  }
  else if (currentHour >= 14 && currentHour < 18) {
    return '下午'
  }
  return '晚上'
}

const timer = setInterval(() => {
  time.value = getTimeOfDay()
}, 60000)

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="chat-index-page">
    <div min-h="0" flex="grow-4" />
    <div>
      <h1 text="center 32px" m="b-32px">
        {{ time }}好，{{ userName }}
      </h1>
      <chat-input />
      <chat-skills-list m="t-24px" />
    </div>
    <div min-h="0" flex="grow-6" />
  </div>
</template>

<style scoped lang="scss">
.chat-index-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
