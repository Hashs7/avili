<template>
  <div>
    <div class="ui-container">
      <button class="btn-play" data-hover="big" data-click="disapear" @click="play">Jouer</button>
    </div>
    <canvas ref="homeCanvas" class="home-canvas webgl-render" />
  </div>
</template>

<script>
  import HomeArtwork from "../core/HomeArtwork";

  export default {
    name: "Artwork",
    computed: {
      qualitySet() {
        return this.$store.state.quality;
      },
    },
    mounted() {
      this.artwork = new HomeArtwork(this.$refs.homeCanvas, this.qualitySet);
    },
    methods: {
      play() {
        this.artwork.destroy();
        this.$store.commit('setPlaying', true);
      }
    },
  }
</script>

<style lang="scss" scoped>
  .ui-container {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }
  .home-canvas {}
  .btn-play {
    position: absolute;
    top: 50%;
    left: 120px;
    padding: 16px 32px;
    font-size: 30px;
    font-family: $font-primary;
    text-transform: uppercase;
    color: $primary;
    background-color: #fff;
  }
  .btn-play2 {
    @extend .btn-play;
    top: 60%;
  }
</style>