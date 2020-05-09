<template>
  <transition
      @enter="enter"
      @leave="leave"
  >
    <div v-if="subtitle" class="testimony-container">
      <div class="testimony__background" ref="bg" :style="{ backgroundImage: `url(${background})` }" />
      <p ref="testimony" class="testimony">{{ subtitle }}</p>
    </div>
  </transition>
</template>

<script>
  import gsap from 'gsap'
  import background from '@/assets/img/subtitle-backgroud.png';

  export default {
    name: 'Testimony',
    data() {
      return {
        background,
        subtitle: null,
      }
    },
    methods: {
      enter(el, done) {
        gsap.from(this.$refs.bg, {
          opacity: 0,
          y: 15,
          duration: .5,
          onComplete: () => {
            done()
          },
        });
        gsap.from(this.$refs.testimony, {
          opacity: 0,
          y: 5,
          duration: .5,
        });
      },
      leave(el, done) {
        gsap.to(this.$refs.bg, {
          opacity: 0,
          y: 15,
          duration: .5,
          onComplete: () => {
            done()
          },
        });
        gsap.to(this.$refs.testimony, {
          opacity: 0,
          y: 5,
          duration: .5,
        });
      },
    },
  }
</script>

<style lang="scss" scoped>
  .testimony-container {
    font-family: $font-body;
    text-align: center;
    font-size: 22px;
    user-select: none;
  }

  .testimony {
    position: fixed;
    z-index: 300;
    bottom: 80px;
    left: 0;
    right: 0;
    margin: auto;
    max-width: 650px;
    padding: 0 16px;
    color: $white;
  }

  .testimony__background {
    position: fixed;
    z-index: 200;
    bottom: 0;
    left: 0;
    right: 0;
    height: 600px;
    background-size: cover;
    background-position: center;
  }
</style>