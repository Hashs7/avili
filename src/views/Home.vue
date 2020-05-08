<template>
  <div class="home" :style="{ backgroundImage: `url(${background})` }">
    <CircleIcon class="circle-background" />
    <QualitySelection v-if="!qualitySet"/>
    <PseudoSelection v-if="qualitySet && !pseudo" />
  </div>
</template>

<script>
import QualitySelection from '@/components/UI/Quality/QualitySelection';
import PseudoSelection from '@/components/UI/PseudoSelection';
import background from '@/assets/img/background.png'
import CircleIcon from '@/assets/icons/circle.svg';

export default {
  name: 'Home',
  components: {
    QualitySelection,
    PseudoSelection,
    CircleIcon,
  },
  data() {
    return {
      background,
      axes: null,
      controls: null,
    }
  },
  computed: {
    qualitySet() {
      return this.$store.state.quality;
    },
    pseudo() {
      return this.$store.state.pseudo;
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.init();
    });
  },
  methods: {
    init() {
      // this.scene.background = new THREE.Color(0xababab);
      // this.camera.position.set(0, -10, 0);
    },
  },
}
</script>

<style lang="scss" scoped>
  .home {
    z-index: 500;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: $white;
    background-size: cover;
    background-position: center;
  }
</style>
