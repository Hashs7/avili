<template>
  <div id="app">
    <Loader />
    <Follower />
    <Navigation />
    <router-view />
    <canvas class="webgl-render" ref="canvas" />
    <div v-if="notSupported" class="not-supported">
      <p>L'expérience n'a pas été prévu pour cet appareil</p>
    </div>
  </div>
</template>

<script>
  import World from '@/components/core/World';
  import Loader from '@/components/UI/Loader';
  import Follower from '@/components/UI/Follower';
  import Navigation from '@/components/UI/layout/Navigation';

  export default {
    name: 'App',
    components: {
      Loader,
      Follower,
      Navigation,
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
        this.width = window.innerWidth;
        this.height = window.innerHeight;
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
    z-index: 1000;
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
