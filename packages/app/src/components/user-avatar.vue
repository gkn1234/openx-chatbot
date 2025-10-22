<script setup lang="ts">
import userImg from '../assets/default-head-img.png';

withDefaults(defineProps<{
  /** 头像 url */
  src?: string

  /** 缺省头像 url */
  defaultSrc?: string

  /** 头像尺寸，css 属性 */
  size?: string
}>(), {
  src: '',
  defaultSrc: userImg,
  size: '36px',
});
</script>

<template>
  <el-image
    class="user-avatar"
    :src="src">
    <template #error>
      <img :src="defaultSrc">
    </template>
  </el-image>
</template>

<style lang="scss" scoped>
.user-avatar {
  width: v-bind(size);
  height: v-bind(size);
  border-radius: 100%;
}
</style>
