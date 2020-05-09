<template>
  <transition
      @enter="enter"
      @leave="leave"
  >
    <div class="indication" v-show="show">
      <div class="indication__content">
        <div>
          <h2 class="indication__title" ref="title">{{ title }}</h2>
          <Chevron class="indication__chevron" ref="chevron" />
        </div>
        <p class="indication__txt" ref="txt">{{ text }}</p>
      </div>
      <div class="indication__background" ref="bg" :style="{ backgroundImage: `url(${background})` }" />
    </div>
  </transition>
</template>

<script>
  import gsap from 'gsap';
  import background from '@/assets/img/tuto-background.png'
  import Chevron from '@/assets/icons/chevron-medium.svg';

  export default {
    name: "Indication",
    components: {
      Chevron,
    },
    data() {
      return {
        background,
        show: false,
        tl: null,
        title: "Déplacement",
        text: "Appuyez sur la touche z pour avancer et utilisez votre souris pour vous orienter",
      }
    },
    mounted() {
      setInterval(() => this.show = !this.show, 3000);
      this.tl = gsap.timeline({ paused: true });
      this.tl.from(this.$refs.bg, {
        y: -15,
        opacity: 0,
        duration: .5,
      },  'start');
      this.tl.from(this.$refs.title, {
        y: 5,
        opacity: 0,
        duration: .5,
      }, 'start');
      this.tl.from(this.$refs.chevron, {
        y: 5,
        opacity: 0,
        duration: .5,
      }, '-=.3');
      this.tl.from(this.$refs.txt, {
        y: 5,
        opacity: 0,
        delay: .1,
        duration: .5,
      }, '-=.3');
    },
    methods: {
      enter(el, done) {
        this.tl.onComplete = () => done();
        this.tl.play();
      },
      leave(el, done) {
        this.tl.onReverseComplete = () => done();
        this.tl.reverse();
      },
    },
  }
</script>

<style lang="scss" scoped>
  .indication__background {
    position: fixed;
    z-index: 200;
    top: 0;
    left: 0;
    right: 0;
    background-size: cover;
    background-position: center;
    height: 450px;
  }

  .indication__title {
    font-family: $font-primary;
    font-weight: 400;
    font-size: 32px;
    text-transform: uppercase;
  }

  .indication__chevron {
    width: 170px;
    margin: auto;
  }

  .indication__content {
    position: fixed;
    z-index: 300;
    top: 80px;
    left: 0;
    right: 0;
    margin: auto;
    max-width: 480px;
    padding: 0 16px;
    color: $white;
    text-align: center;
  }

  .indication__txt {
    margin-top: 20px;
    font-weight: bold;
    font-size: 20px;
  }

</style>