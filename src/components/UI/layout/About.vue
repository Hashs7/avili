<template>
  <transition
      @enter="enter"
      @leave="leave"
  >
    <div v-show="showAbout" class="about" ref="container">
      <div class="about__container">
        <span class="about__line"/>
        <div class="about__background"/>

        <button data-hover="big" class="about__close" @click="hideAbout" ref="close">
          <Close/>
        </button>

        <div class="about__content">
          <div class="about__title" ref="content1">
            <h3>{{ $t('ui.about')}}</h3>
            <div class="about__title-chevron">
              <Chevron/>
            </div>
          </div>

          <p class="about__duration" ref="content2">{{ $t('ui.content.duration')}}</p>

          <div class="about__description" ref="content3">
            <h4 class="lines">Avili</h4>
            <p>“{{ $t('ui.content.definition')}}”</p>
            <p>{{ $t('ui.content.description')}}</p>
          </div>

          <div class="about__credits" ref="content4">
            <h4 class="lines">{{ $t('ui.credits')}}</h4>
            <div class="credits">
              <p>{{ $t('ui.dev')}} :</p>
              <p>Sébastien Hernoux — Guillaume Lagouy</p>
            </div>
            <div class="credits">
              <p>{{ $t('ui.design')}} :</p>
              <p> Antoine Rault</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  import gsap from 'gsap';
  import Chevron from '@/assets/icons/chevron.svg';
  import Close from '@/assets/icons/avili_x.svg';
  import LineIcon from '@/assets/icons/avili_line.svg';

  export default {
    name: "About",
    components: {
      Chevron,
      Close,
      LineIcon,
    },
    data() {
      return {
        tl: null
      }
    },
    computed: {
      showAbout() {
        return this.$store.state.showAbout;
      }
    },
    mounted() {
      this.tl = gsap.timeline({ paused: true });
      this.tl.to(this.$refs.container, {
        x: 0,
        duration: .7,
      });
      this.tl.from([this.$refs.content1, this.$refs.content2, this.$refs.content3, this.$refs.content4], {
        y: 10,
        opacity: 0,
        stagger: .15,
        duration: .3,
      }, '-=.4');
    },
    methods: {
      hideAbout() {
        this.$store.commit('toggleAbout', false);
      },
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
  .about {
    z-index: 1000;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 675px;
    text-align: center;
    transform: translateX(100%);
  }

  .about__background {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background-color: #04081C;
    clip-path: polygon(12% 0, 100% 0%, 100% 100%, 0% 100%);
  }

  .about__container {
    position: relative;
    height: 100%;
  }

  .about__line {
    position: absolute;
    z-index: 1001;
    left: 42px;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: $white;
    transform: rotate(3deg);
  }

  .about__content {
    position: relative;
    padding-top: 70px;
  }

  .about__close {
    z-index: 1002;
    position: absolute;
    top: 48px;
    left: 38px;
    padding: 0;
    width: 75px;
    height: 75px;
    box-shadow: 0 3px 6px 0 rgba(0,0,0,0.15);
  }

  .lines {
    display: inline-block;
    position: relative;
    font-family: $font-pseudo;

    &:before, &:after {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      margin: auto;
      background-color: $white;
      opacity: .4;
      width: 32px;
      height: 1px;
    }

    &:before {
      left: -11px;
      transform: translateX(-100%);
    }

    &:after {
      right: -11px;
      transform: translateX(100%);
    }
  }

  .about__title-chevron {
    width: 130px;
    display: block;
    margin: auto;
  }

  .about__duration {
    display: block;
    max-width: 165px;
    margin: 40px auto 24px auto;
    font-size: 14px !important;
  }

  .about__description {
    .lines {
      display: inline-block;
      margin-bottom: 30px;
    }

    p {
      display: block;
      max-width: 340px;
      margin: auto auto 28px auto;

      &:first-child {
        max-width: 280px;
      }
    }
  }

  .about__credits {
    display: block;
    margin-top: 36px;

    .lines {
      display: inline-block;
      margin-bottom: 30px;
    }

    .credits {
      display: block;
      margin-bottom: 24px;
    }
  }

  .about__content {
    padding-left: 55px;

    p {
      font-size: 16px;
    }
  }
</style>