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
        <div class="indication__txt" ref="txt">
          <p v-if="title === 'Déplacement'">Appuyez sur la touche <span class="indication__key"><Key /></span> pour avancer et utilisez votre souris pour vous orienter</p>
          <p v-else-if="title === 'Movement'">Push <span class="indication__key"><Key /></span> to move forward and use your mouse to rotate</p>
          <p v-else>{{ text }}</p>
        </div>
      </div>
      <div class="indication__background" ref="bg" :style="{ backgroundImage: `url(${background})` }" />
    </div>
  </transition>
</template>

<script>
  import gsap from 'gsap';
  import background from '@/assets/img/tuto-background.png'
  import Chevron from '@/assets/icons/chevron-medium.svg';
  import Key from '@/assets/icons/z-key.svg';

  export default {
    name: "Indication",
    components: {
      Chevron,
      Key,
    },
    data() {
      return {
        background,
        show: false,
        movement: false,
        tl: null,
        title: null,
        text: null,
      }
    },
    mounted() {
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
        this.tl.onReverseComplete = () => {
          done();
          this.title = null;
          this.text = null;
        };
        this.tl.reverse();
      },
      setIndication(name) {
        this.title = this.$t(`indications.${name}.title`);
        this.text = this.$t(`indications.${name}.text`);
        this.show = true;
        if (name === 'start') {
          this.movement = true;
        }
      },
      removeIndication() {
        this.show = false;
        this.movement = false;
      }
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
    user-select: none;
  }

  .indication__chevron {
    width: 170px;
    margin: auto;
  }

  .indication__key {
    display: inline-block;
    width: 30px;
    margin: 0 3px;
    vertical-align: middle;
  }

  .indication__content {
    position: fixed;
    z-index: 300;
    top: 80px;
    left: 0;
    right: 0;
    margin: auto;
    max-width: 450px;
    padding: 0 16px;
    color: $white;
    text-align: center;
    user-select: none;
  }

  .indication__txt {
    user-select: none;
    margin-top: 20px;
    font-weight: bold;
    font-size: 20px;
    p {
      display: inline-block;
      vertical-align: middle;
    }
  }

</style>