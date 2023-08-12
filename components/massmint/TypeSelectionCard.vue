<template>
  <a href="/" class="type-selection-card">
    <div class="icon">
      <slot />
    </div>

    <p class="card-title">{{ props.title }}</p>
    <p class="card-description">{{ props.description }}</p>
  </a>
</template>

<script lang="ts" setup>
const props = defineProps<{
  title: string
  description: string
}>()
</script>

<style lang="scss" scoped>
@import '@/styles/abstracts/_theme.scss';

.type-selection-card {
  padding: 64px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  @include ktheme() {
    border: 1px solid theme('k-grey');
    color: theme('k-white');
    .icon {
      svg {
        fill: theme('k-white');
        width: 60px !important;
        height: 60.308px !important;
      }
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
