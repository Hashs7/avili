<template>
  <transition
      @enter="enter"
      @leave="leave"
  >
    <div v-show="isPlaying && isLoading || !completeTime" class="modal">
      <div class="loader">
        <div class="loader__container">
          <span ref="progress" class="loader__progress"></span>
        </div>
        <span class="loader__percent">{{percent}}%</span>
      </div>
      <div class="advertising">
        <span ref="advertising">L'usage d'un casque audio est vivement recommandé</span>
      </div>
    </div>
  </transition>
</template>

<script>
  import gsap from 'gsap';
  import LoadManager from "../core/LoadManager";

  export default {
    name: 'Loader',
    data() {
      return {
        percent: 0,
        minTime: 4000,
        completeTime: false
      }
    },
    computed: {
      isLoading() {
        return this.$store.state.isLoading;
      },
      isPlaying() {
        return this.$store.state.isPlaying;
      }
    },
    watch: {
      /*qualitySet(newVal) {
       this.world.setQuality(newVal);
       },*/
      isPlaying(newVal) {
        if (!newVal) return;
        LoadManager.setReceiver(this);
        setTimeout(() => this.completeTime = true, this.minTime);
        gsap.from(this.$refs.advertising, {
          opacity: 0,
          y: 40,
          delay: 1,
          duration: 3,
        });
      }
    },
    methods: {
      enter(el, done) {},
      leave(el, done) {
        console.log('hide loader');
        gsap.to(this.$refs.advertising, {
          opacity: 0,
          y: -40,
          onComplete: () => {
            done()
          },
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

<style scoped>
  .modal {
    z-index: 400;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: black;
  }
  .advertising {
    position: fixed;
    display: flex;
    align-items: center;
    max-width: 300px;
    text-align: center;
    color: white;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
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