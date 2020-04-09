<template>
  <div id="app">
    <Loader />
    <Follower />
    <Navigation />
    <router-view />
    <canvas ref="canvas" />
    <div v-if="notSupported" class="not-supported">
      <p>L'expérience n'a pas été prévu pour cet appareil</p>
    </div>
  </div>
</template>

<script>
  import World from '@/components/core/World';
  import Loader from '@/components/Loader';
  import Follower from '@/components/Follower';
  import Navigation from '@/components/layout/Navigation';

  export default {
    name: 'App',
    components: {
      Loader,
      Follower,
      Navigation,
    },
    data() {
      return {
        width: 0,
        height: 0,
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
        return this.width < 425;
      }
    },
    mounted() {
      this.world = new World(this.$refs.canvas);
      this.resize();
      window.addEventListener('resize', this.resize);
    },
    methods: {
      resize() {
        this.width = this.$refs.canvas.clientWidth;
        this.height = this.$refs.canvas.clientHeight;
        this.world.resize();
      },
    },
  }
</script>

<style lang="scss">
  body {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    margin: 0;
    font-family: sans-serif;
  }
  canvas {
    display: block;
    width: 100vw;
    height: 100vh;
  }
  .not-supported {
    z-index: 1000;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: $white;
    background-color: #2A2A2A;
  }
</style>
