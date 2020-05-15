<template>
  <div class="intro-layout" :class="{white}" :style="{ backgroundImage: `url(${background})` }">
    <CircleIcon class="circle-background" ref="circle" v-show="show"/>
    <slot></slot>
  </div>
</template>

<script>
  import gsap from 'gsap';
  import CircleIcon from '@/assets/icons/circle.svg';
  import backgroundDark from '@/assets/img/background.png'
  import backgroundWhite from '@/assets/img/background-white.png'

  export default {
    name: "IntroLayout",
    components: {
      CircleIcon,
    },
    props: {
      show: {
        type: Boolean,
        default: true,
      },
      white: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        background: backgroundDark,
        rect: null,
        delta: null,
      }
    },
    computed: {
      qualitySet() {
        return this.$store.state.quality;
      },
      pseudo() {
        return this.$store.state.pseudo;
      },
      isLoading() {
        return this.$store.state.isLoading;
      },
      isPlaying() {
        return this.$store.state.isPlaying;
      }
    },
    watch: {
      show(newVal) {
        if (!newVal) return;
        window.removeEventListener('mousemove', this.mouseMove);
      },
    },
    mounted() {
      if (this.white) {
        this.background = backgroundWhite;
      }
      if (!this.$refs.circle) return;
      this.rect = this.$refs.circle.getBoundingClientRect();
      window.addEventListener('mousemove', this.mouseMove, { passive: true });
      this.$on('hook:beforeDestroy', () => {
        window.removeEventListener('mousemove', this.mouseMove);
      });
    },
    methods: {
      mouseMove(e) {
        const detectDistance = 1000;
        const movingDistance = 30;

        const center = {
          x: this.rect.left + this.rect.width / 2,
          y: this.rect.top + this.rect.height / 2,
        };
        const x = e.x < center.x && e.x > center.x + this.rect.width / 2 + detectDistance ? (center.x - e.x) / detectDistance : (e.x - center.x) / detectDistance;
        const y = e.y < center.y && e.y > center.y + this.rect.height / 2 + detectDistance ? (center.y - e.y) / detectDistance : (e.y - center.y) / detectDistance;

        gsap.to(this.$refs.circle, {
          x: x * movingDistance + this.delta,
          y: y * movingDistance - this.delta,
          duration: 1.5,
        });
      },
      isNear(e, distance) {
        const deltaTop = this.rect.top - distance + (this.rect.height / 2);
        const deltaLeft = this.rect.left - distance + (this.rect.width / 2);
        const deltaBottom = this.rect.bottom + distance - (this.rect.height / 2);
        const deltaRight = this.rect.right + distance - (this.rect.width / 2);
        return (e.x > deltaLeft && e.x < deltaRight && e.y > deltaTop && e.y < deltaBottom);
      },
    },
  }
</script>

<style lang="scss" scoped>
  .intro-layout {
    user-select: none;
    z-index: 500;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: $white;
    background-size: cover;
    background-position: center;

    &.white {
      color: #04081C !important;

      .quality-selection__chevron path {
        fill: #04081C;
      }
      .circle-background {
        path, rect {
          fill: #04081C;
        }
      }
    }
  }
</style>