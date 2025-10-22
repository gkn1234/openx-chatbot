<script setup lang="ts">
import { ChatInputMenuItemContext } from './composables/menu-item'

const props = defineProps<{ id: any }>()

const context = new ChatInputMenuItemContext(props.id)
const {
  itemEl,
  collapse,
} = context
const {
  menuEl,
} = context.menu

const inMenu = computed(() => menuEl.value && collapse.value)
</script>

<template>
  <Teleport :disabled="!inMenu" :to="menuEl">
    <div
      ref="itemEl"
      class="chat-input-menu-item"
      :data-chat-input-menu-item-id="id"
      v-bind="$attrs">
      <slot v-if="!inMenu" />
      <slot v-else name="collapse" />
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
</style>
