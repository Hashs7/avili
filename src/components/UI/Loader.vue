<template>
  <transition
      @enter="enter"
      @leave="leave"
  >
    <div v-show="isPlaying && loadEnable || !completeTime" :class="{show: isPlaying && loadEnable || !completeTime}" class="loader-wrap" ref="loader">
      <IntroLayout>
        <div class="loader">
          <div class="loader__container">
            <span ref="progress" class="loader__progress"></span>
          </div>
          <span class="loader__percent">{{percent}}%</span>
        </div>
        <div class="advertising">
          <img ref="img" src="@/assets/img/headset.png" alt="headset icon" draggable="false" class="advertising__headset">
          <span ref="advertising">L'usage d'un casque audio est vivement recommandé</span>
        </div>
      </IntroLayout>
    </div>
  </transition>
</template>

<script>
  import gsap from 'gsap';
  import LoadManager from "../core/LoadManager";
  import IntroLayout from '@/components/UI/IntroLayout';

  export default {
    name: 'Loader',
    components: {
      IntroLayout,
    },
    data() {
      return {
        percent: 0,
        minTime: 5000,
        completeTime: true,
      }
    },
    computed: {
      loadEnable() {
        return this.$store.state.loadEnable;
      },
      isPlaying() {
        return this.$store.state.isPlaying;
      },
      isLoading() {
        return this.$store.state.isLoading;
      },
      pseudo() {
        return this.$store.state.pseudo;
      },
      qualitySet() {
        return this.$store.state.quality;
      }
    },
    watch: {
      /*qualitySet(newVal) {
       this.world.setQuality(newVal);
       },*/
      isPlaying(newVal) {
        if (!newVal) return;
        this.initLoader();
      }
    },
    mounted() {
      console.log(this.isPlaying, this.loadEnable, !this.completeTime);
      if (!this.isPlaying) return;
      this.initLoader();
    },
    methods: {
      initLoader() {
        console.log('initLoader');
        this.completeTime = false;
        LoadManager.setReceiver(this);
        setTimeout(() => this.completeTime = true, this.minTime);
        /*gsap.from(this.$refs.advertising, {
          opacity: 0,
          y: 20,
          delay: 2,
          duration: 3,
        });
        gsap.from(this.$refs.img, {
          opacity: 0,
          delay: 2,
          duration: 3,
        });*/
      },
      enter(el, done) {
        console.log('enter loader');
        gsap.to(this.$refs.loader, {
          opacity: 1,
          duration: 0.1,
          onComplete: () => {
            done()
          },
        });
      },
      leave(el, done) {
        gsap.to(this.$refs.advertising, {
          opacity: 0,
          y: -20,
          onComplete: () => {
            done()
          },
        });
        gsap.to(this.$refs.img, {
          opacity: 0,
        });
      },
      progressHandler(percent) {
        const percentValue = this.percent < percent ? percent : this.percent;
        this.updateUI(percentValue);
        if (percent !== 100) return;
        setTimeout(() => {
          this.$store.commit('setLoader', false);
          // this.percent = 0;
          // this.updateUI(0);
        }, 500)
      },
      updateUI(value) {
        gsap.to(this, {
          percent: Math.round(value),
          duration: .01,
        });
        gsap.to(this.$refs.progress, {
          width: `${value}%`,
          duration: .01,
        });
      },
    },
  }
</script>

<style lang="scss" scoped>
  .loader-wrap {
    opacity: 0;
    &.show {
      opacity: 1;
    }
  }
  .advertising {
    position: fixed;
    z-index: 100;
    display: flex;
    justify-content: center;
    flex-direction: column;
    max-width: 300px;
    text-align: center;
    color: white;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    font-size: 22px;
    line-height: 34px;
    font-family: $font-body;
  }
  .advertising__headset {
    display: block;
    width: 172px;
    margin: 0 auto 32px auto;
  }
  .loader {
    position: fixed;
    bottom: 50px;
    right: 70px;
    margin: auto;
  }
  .loader__percent {
    position: relative;
    z-index: 10000;
    display: inline-block;
    margin-top: 8px;
    text-align: center;
    color: white;
    margin-left: 16px;
    font-size: 30px;
    font-family: $font-pseudo;
    font-weight: bold;
  }
  .loader__container {
    display: inline-block;
    width: 140px;
    height: 10px;
    background-color: gray;
  }
  .loader__progress {
    display: block;
    width: 0;
    height: 100%;
    background-color: #fff;
  }
</style>