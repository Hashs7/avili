<template>
  <transition>
    <div v-if="isLoading" class="modal">
      <div class="loader">
        <div class="loader__container">
          <span ref="progress" class="loader__progress"></span>
        </div>
        <span class="loader__percent">{{percent}}%</span>
      </div>
    </div>
  </transition>
</template>

<script>
  import gsap from 'gsap';
  import LoadManager from "../core/LoadManager";

  export default {
    name: "Loader",
    data() {
      return {
        percent: 0,
      }
    },
    computed: {
      isLoading() {
        return this.$store.state.isLoading;
      }
    },
    mounted() {
      const loaderInstance = LoadManager;
      loaderInstance.setReceiver(this);
    },
    methods: {
      progressHandler(percent) {
        const percentValue = this.percent < percent ? percent : this.percent;
        this.updateUI(percentValue);
        if (percent !== 100) return;
        setTimeout(() => {
          this.$store.commit('setLoader', false);
          this.percent = 0;
          this.updateUI(0);
        }, 500)
      },
      updateUI(value) {
        gsap.to(this, {
          percent: value,
          duration: .05,
        });
        gsap.to(this.$refs.progress, {
          width: `${value}%`,
          duration: .1,
        });
      }
    },
  }
</script>

<style scoped>
  .modal {
    z-index: 1000;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: black;
  }
  .loader {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    width: 200px;
    height: 30px;
  }
  .loader__percent {
    position: relative;
    z-index: 10000;
    display: block;
    margin-top: 8px;
    text-align: center;
    color: white;
  }
  .loader__container {
    height: 10px;
    background-color: gray;
  }
  .loader__progress {
    display: block;
    width: 0;
    height: 100%;
    background-color: #fff;
    transition: width .2s ease-in-out;
  }
</style>