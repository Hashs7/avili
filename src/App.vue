<template>
  <div id="app">
    <Loader/>
    <Follower ref="follower"/>
    <Testimony ref="testimony"/>
    <Indication ref="indication"/>
    <Communication ref="communication"/>

    <router-view/>

    <canvas class="webgl-render" ref="canvas" />
    <FinalScreen />

    <div v-if="notSupported" class="not-supported">
      <p>L'expérience n'a pas été prévu pour cet appareil</p>
    </div>
  </div>
</template>

<script>
  import World from '@/components/core/World';
  import Loader from '@/components/UI/Loader';
  import Follower from '@/components/UI/Follower';
  import Testimony from '@/components/UI/layout/Testimony';
  import Indication from '@/components/UI/layout/Indication';
  import Communication from '@/components/UI/layout/Communication';
  import FinalScreen from '@/components/UI/FinalScreen';

  export default {
    name: 'App',
    components: {
      Loader,
      Follower,
      Testimony,
      Indication,
      Communication,
      FinalScreen,
    },
    data() {
      return {
        width: 1200,
        height: 500,
        world: null,
      }
    },
    computed: {
      camera() {
        return this.$store.state.camera;
      },
      renderer() {
        return this.$store.state.renderer;
      },
      notSupported() {
        return this.width < 900;
      },
      loaderVisible() {
        return this.$store.state.loaderVisible;
      },
      qualitySet() {
        return this.$store.state.quality;
      },
      isPlaying() {
        return this.$store.state.isPlaying;
      },
      pseudo() {
        return this.$store.state.pseudo;
      },
      isFinal() {
        return this.$store.state.isFinal;
      }
    },
    watch: {
      /*qualitySet(newVal) {
        this.world.setQuality(newVal);
      },*/
      isPlaying(newVal) {
        if (!newVal && !this.world) return;
        this.initWorld();
      },
      loaderVisible(newVal) {
        if (newVal || !this.world) return;
        this.world.loaderFinished();
      }
    },
    mounted() {
      this.resize();
      window.addEventListener('resize', this.resize);
      document.addEventListener("contextmenu", (e) => e.preventDefault(), false);
      if (!this.isPlaying && !this.world) return;
      this.$nextTick(() => {
        this.initWorld();
      })
    },
    methods: {
      initWorld() {
        this.world = new World(this.$refs.canvas, this.$store, this.pseudo);
        this.world.setQuality(this.qualitySet);
        this.world.setTestimony(this.$refs.testimony, this.$t);
        this.world.setIndication(this.$refs.indication, this.$t);
        this.world.setFollower(this.$refs.follower);
        this.resize();
      },
      resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        if (!this.world) return;
        this.world.resize();
      },
    },
  }
</script>

<style lang="scss">
  .webgl-render {
    display: block;
    width: 100vw !important;
    height: 100vh !important;
  }

  .not-supported {
    z-index: 10000;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 32px;
    color: $white;
    text-align: center;
    background-color: #2A2A2A;
  }
</style>
