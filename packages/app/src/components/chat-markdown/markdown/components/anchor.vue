<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

const attrs = useAttrs();

const target = computed(() => {
  const href = attrs.href as string;
  return href.startsWith('#') ? '_self' : '_blank';
});
</script>

<template>
  <a v-bind="$attrs" :target="target"><slot /></a>
</template>
