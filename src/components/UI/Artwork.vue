<template>
  <div>
    <div class="ui-container">
      <div class="logo-container">
        <img ref="img" src="@/assets/img/logo.png" alt="logo" draggable="false" class="logo">
        <div class="btn-play">
          <button class="btn-container" data-hover="big" data-click="disapear" @click="play">
            <span class="text">{{ $t('ui.play') }}</span>
            <span class="icon"><PlayIcon/></span>
          </button>
        </div>
      </div>

      <button class="btn-about" data-hover="big" data-click="disapear" @click="showAbout">{{ $t('ui.about') }}</button>
      <div class="lang-container">
        <button :class="{current: $i18n.locale() === 'fr'}" class="btn-lang fr" data-hover="big"
                @click="setLang('fr')">fr
        </button>
        <span>-</span>
        <button :class="{current: $i18n.locale() === 'en'}" class="btn-lang en" data-hover="big"
                @click="setLang('en')">en
        </button>
      </div>
    </div>
    <div class="vignettage" :style="{ backgroundImage: `url(${background})` }" />
    <About/>
    <canvas ref="homeCanvas" class="home-canvas webgl-render"/>
  </div>
</template>

<script>
  import HomeArtwork from "../core/HomeArtwork";
  import AudioManager from "../core/AudioManager";
  import About from './layout/About';
  import PlayIcon from '@/assets/icons/avili_play.svg';
  import background from '@/assets/img/vignettage.png';

  export default {
    name: "Artwork",
    components: {
      About,
      PlayIcon,
    },
    data() {
      return {
        background,
      }
    },
    computed: {
      qualitySet() {
        return this.$store.state.quality;
      },
      pseudo() {
        return this.$store.state.pseudo;
      },
    },
    watch: {
      pseudo(newVal) {
        if (!newVal) return;
        AudioManager.setIntroLoopAudio();
      }
    },
    mounted() {
      this.artwork = new HomeArtwork(this.$refs.homeCanvas, this.qualitySet);
    },
    methods: {
      play() {
        this.artwork.destroy();
        this.$store.commit('setPlaying', true);
      },
      showAbout() {
        this.$store.commit('toggleAbout', true);
      },
      setLang(lang) {
        this.$i18n.set(lang);
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

  .logo-container {
    position: absolute;
    top: 170px;
    left: 170px;
    .logo {
      width: 520px;
    }
  }

  .vignettage {
    position: absolute;
    z-index: 10;
    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
    background-position: bottom right;
    background-size: cover;
  }

  .btn-play {
    margin: 64px auto 0 auto;
    width: 220px;
    height: 70px;
    font-size: 30px;
    font-family: $font-primary;
    text-transform: uppercase;
    color: $white;

    .btn-container {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .text {
      vertical-align: sub;
      position: relative;
      z-index: 10;
      color: $white;
      font-family: $font-primary;
      font-size: 30px;
      text-transform: uppercase;
      transition: color .3s ease-in-out;
    }

    .icon {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }
    .play-icon path {
      transition: fill .3s ease-in-out;
    }

    &:hover {
      .play-icon .play-color {
        fill: #FAEBD7;
      }
      .play-icon .play-border {
        fill: #04081C;
      }
      .text {
        color: #04081C;
      }
    }
  }

  .btn-about {
    position: absolute;
    top: 70px;
    right: 120px;
    font-family: $font-body;
    color: $white;
    font-size: 22px;
  }

  .btn-lang {
    font-size: 22px;
    color: $white;
    font-family: $font-body;

    &.current {
      text-transform: uppercase;
    }
  }

  .lang-container {
    position: absolute;
    bottom: 100px;
    right: 128px;
    color: $white;
  }
</style>