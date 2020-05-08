<template>
  <button class="btn" @click="$emit('click')" data-hover="big">
    <span class="btn__title">
      <slot></slot>
    </span>
    <span class="btn__hover">
      <slot></slot>
    </span>
  </button>
</template>

<script>
  export default {
    name: "Button"
  }
</script>

<style lang="scss" scoped>
  .btn {
    position: relative;
    padding: 8px 16px;
    background: none;
    border: none;
    text-align: center;
    line-height: 1;

    &:hover {
      .btn__title {
        color: $primary;
      }
      .btn__hover {
        opacity: 1;
        transform: rotate(-15deg);
      }
    }
  }
  .btn__title {
    pointer-events: none;
    user-select: none;
    color: $white;
    line-height: 1;
    font-family: $font-primary;
    font-size: 30px;
    transition: all .3s ease-in-out;
  }
  .btn__hover {
    pointer-events: none;
    position: absolute;
    bottom: -8px;
    right: 0;
    left: 0;
    margin: auto;
    color: $white;
    font-family: $font-btn;
    font-size: 48px;
    opacity: 0;
    transform: rotate(-7deg);
    transition: all .3s ease-in-out;
  }
</style>