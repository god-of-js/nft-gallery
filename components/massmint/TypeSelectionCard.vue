<template>
  <div class="type-selection-card" @click="selectType">
    <!-- TODO: investigate why the svg acts weirdly when nuxt-link is been used. -->
    <slot />
    <p class="card-title">{{ props.title }}</p>
    <p class="card-description">{{ props.description }}</p>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  title: string
  description: string
  href: string
}>()
const emit = defineEmits<{
  (e: 'select', url: string): void
}>()

function selectType() {
  emit('select', props.href)
}
</script>

<style lang="scss" scoped>
@import '@/styles/abstracts/variables';

.type-selection-card {
  padding: 64px 32px;
  display: flex;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  border: 1px solid;
  @include ktheme() {
    background: theme('background-color');
  }
  svg {
    width: 3rem;
    height: 3rem;
    @include ktheme() {
      fill: theme('text-color');
    }
  }

  .card-title {
    font-family: Work Sans;
    font-size: 25px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    text-transform: capitalize;
    margin-top: 16px;
  }
  .card-description {
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
    text-transform: capitalize;
  }
}
</style>
