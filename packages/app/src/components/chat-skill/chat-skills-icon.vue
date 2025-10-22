<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** 技能图标 url，只支持 svg 图标。优先级高于 class */
  url?: string
}>(), {
  url: '',
})

const urlStyle = computed(() => props.url ?
    {} :
    {
      '--chat-skills-icon': `url("${props.url}")`,
    })
</script>

<template>
  <i :style="[urlStyle]" />
</template>

<style scoped lang="scss">
.chat-skills-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  color: inherit;
  background-color: currentcolor;
  /* stylelint-disable-next-line property-no-vendor-prefix */
  -webkit-mask: var(--chat-skills-icon) no-repeat;
  mask: var(--chat-skills-icon) no-repeat;
  /* stylelint-disable-next-line property-no-vendor-prefix */
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
</style>
