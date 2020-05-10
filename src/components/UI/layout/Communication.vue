<template>
  <ul class="communication">
    <li v-for="(p, i) in playerTalking" :key="i" class="communication__player">
      <span class="communication__title">{{ p }}</span>
      <span class="communication__icon"><Speaker /></span>
    </li>
  </ul>
</template>

<script>
  import Speaker from '@/assets/icons/speaker.svg';

  export default {
    name: "Communication",
    components: {
      Speaker,
    },
    computed: {
      playerTalking() {
        return this.$store.state.playerTalking;
      }
    },
  }
</script>

<style lang="scss" scoped>
  .communication {
    position: absolute;
    top: 35px;
    left: 35px;
  }

  .communication__title {
    display: inline-block;
    font-size: 26px;
    color: $white;
    vertical-align: top;
    font-family: $font-pseudo;
    text-shadow: -2px 2px $primary;
  }

  .communication__icon {
    display: inline-block;
    width: 30px;
    vertical-align: middle;
    margin-left: 10px;
  }
</style>