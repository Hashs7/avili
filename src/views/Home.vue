<template>
  <div>
    <QualitySelection v-if="!qualitySet"/>
  </div>
</template>

<script>
import gsap from 'gsap';
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import QualitySelection from '@/components/QualitySelection';

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
