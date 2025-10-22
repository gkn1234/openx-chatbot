<script setup lang="ts">
import md from './header.md?raw';

const el = ref();

function delay() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 10);
  });
}

const str = ref('');

/*
onMounted(async () => {
  for (const i of md) {
    str.value += i
    await delay()
  }
})
  */
</script>

<template>
  <div>
    <chat-markdown :value="md" />
  </div>
</template>

<style scoped lang="scss">
</style>
