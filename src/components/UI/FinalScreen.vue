<template>
  <transition @enter="enter" >
    <div v-if="isFinal" ref="modal" class="modal end-screen">
      <input v-if="location" type="text" class="location" name="Element To Be Copied" ref="website" :value="location" />
      <IntroLayout :show="true" :white="true">
        <div class="quality-selection__box">
          <div class="quality-selection__header">
            <h1 class="quality-selection__title">{{ $t('ui.end') }}</h1>
            <Chevron class="quality-selection__chevron" />
          </div>
          <ul class="quality-selection__container">
            <li class="copy">
              <Button @click="copy" :contrast="true">Partager</Button>
              <p ref="feedback" class="feedback">Lien copié</p>
            </li>
            <li>
              <Button @click="openDiscord" :contrast="true">Discord</Button>
            </li>
          </ul>
        </div>
      </IntroLayout>
    </div>
  </transition>
</template>

<script>
  import gsap from 'gsap';
  import IntroLayout from '@/components/UI/IntroLayout';
  import Button from '@/components/UI/Quality/QualityButton';
  import Chevron from '@/assets/icons/chevron.svg';

  export default {
    name: "FinalScreen",
    components: {
      Chevron,
      Button,
      IntroLayout,
    },
    data() {
      return {
        location: null
      }
    },
    computed: {
      isFinal() {
        return this.$store.state.isFinal;
      }
    },
    mounted() {
      this.location = window.location.origin;
    },
    methods: {
      enter(el, done) {
        gsap.to(this.$refs.modal, {
          opacity: 1,
          duration: 1.5,
          onComplete: () => done()
        });
      },
      copy() {
        try {
          this.$refs.website.select();
          document.execCommand('copy');
          const tl = gsap.timeline();
          tl.fromTo(this.$refs.feedback, {
            y: 10,
          }, {
            y: 0,
            opacity: 1
          });
          tl.to(this.$refs.feedback, {
            delay: 3,
            y: -10,
            opacity: 0
          });
        } catch (err) {
          console.error(err);
        }
      },
      openDiscord() {
        console.log('Open discord');
      }
    },
  }
</script>

<style lang="scss" scoped>
  .modal {
    z-index: 1000;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: black;
  }

  .location {
    position: absolute;
    opacity: 0;
  }

  .copy {
    position: relative;

    .feedback {
      opacity: 0;
      position: absolute;
      bottom: -40px;
      left: 0;
      right: 0;
    }
  }

  .end-screen {
    opacity: 0;
    .quality-selection__box {
      max-width: 500px;
    }
    .quality-selection__header {
      max-width: 360px;
    }
  }
</style>