<template>
  <button class="btn" :class="{white: contrast}" @click="$emit('click')" data-hover="big" data-click="disapear">
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
    name: "Button",
    props: {
      contrast: {
        type: Boolean,
        default: false
      },
    },
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
        transform: rotate(-15deg) scale(1);
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
    text-transform: uppercase;
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
    transform: rotate(-7deg) scale(.5);
    transition: all .3s ease-out;
  }

  .btn.white {
    .btn__title {
      color: #04081C;
    }
    &:hover {
      .btn__title {
        opacity: .1;
      }
      .btn__hover {
        color: #04081C;
      }
    }
  }
</style>