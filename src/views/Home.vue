<template>
  <div>
    <QualitySelection v-if="!qualitySet"/>
  </div>
</template>

<script>
import QualitySelection from '@/components/UI/QualitySelection';

export default {
  name: 'Home',
  components: {
    QualitySelection,
  },
  data() {
    return {
      axes: null,
      controls: null,
    }
  },
  computed: {
    qualitySet() {
      return this.$store.state.quality;
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.init();
    });
  },
  beforeDestroy() {
    this.destroy()
  },
  methods: {
    init() {
      // this.scene.background = new THREE.Color(0xababab);
      // this.camera.position.set(0, -10, 0);

    },
  },
}
</script>
