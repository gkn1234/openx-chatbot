<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<{
  level?: number
}>(), {
  level: 1,
});

const attrs = useAttrs();
const tagName = computed(() => `h${props.level}`);
const href = computed(() => `#${attrs.id}`);
</script>

<template>
  <component
    :is="tagName"
    v-bind="$attrs"
    class="header">
    <slot />
    <a
      class="header-anchor"
      i="mdi-link-variant"
      :href="href" />
  </component>
</template>

<style lang="scss" scoped>
.header-anchor {
  display: none;
  margin-left: 4px;
  vertical-align: middle;
  cursor: pointer;
}

.header {
  &:hover {
    .header-anchor {
      display: inline-block;
    }
  }
}

h1 {
  margin-bottom: 12px;
  font-size: 26px;
  line-height: 36px;
}

h2 {
  margin-top: 24px;
  margin-bottom: 12px;
  font-size: 20px;
  line-height: 32px;
}

h3 {
  margin-top: 18px;
  margin-bottom: 12px;
  font-size: 18px;
  line-height: 28px;
}

h4,
h5,
h6 {
  margin-top: 16px;
  margin-bottom: 8px;
  font-size: 16px;
  line-height: 28px;
}
</style>
