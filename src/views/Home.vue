<template>
  <div class="home">
    <IntroLayout v-if="!isPlaying" >
      <QualitySelection v-if="!qualitySet"/>
      <PseudoSelection v-if="qualitySet && !pseudo" />
      <Artwork v-show="qualitySet && pseudo" />
    </IntroLayout>
  </div>
</template>

<script>
import QualitySelection from '@/components/UI/Quality/QualitySelection';
import PseudoSelection from '@/components/UI/PseudoSelection';
import Artwork from '@/components/UI/Artwork';
import IntroLayout from '@/components/UI/IntroLayout';

export default {
  name: 'Home',
  components: {
    QualitySelection,
    PseudoSelection,
    Artwork,
    IntroLayout,
  },
  data() {
    return {
      axes: null,
      controls: null,
      rect: null,
      delta: null,
    }
  },
  computed: {
    qualitySet() {
      return this.$store.state.quality;
    },
    pseudo() {
      return this.$store.state.pseudo;
    },
    isPlaying() {
      return this.$store.state.isPlaying;
    }
  },
}
</script>

<style lang="scss" scoped>
  .full {
    z-index: 501;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
  .content {
    position: relative;
    z-index: 600;
  }
</style>
