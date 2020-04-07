<template>
  <div>Home</div>
</template>

<script>
import gsap from 'gsap';
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default {
  name: 'Home',
  components: {
  },
  data() {
    return {
      axes: null,
      controls: null,
    }
  },
  computed: {
    scene() {
      return this.$store.state.scene;
    },
    camera() {
      return this.$store.state.camera;
    },
    renderer() {
      return this.$store.state.renderer;
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
      this.scene.background = new THREE.Color(0xababab);
      gsap.to(this.camera.position, {
        x: 0,
        y: -10,
        z: 5,
      })
      // this.camera.position.set(0, -10, 0);

      this.axes = new THREE.AxesHelper(5);
      this.scene.add(this.axes);
      this.controls = new OrbitControls( this.camera, this.$store.state.canvasRef);
      this.controls.update();

      this.mainLoop();
    },
    destroy() {
      this.scene.remove(this.axes);
      this.scene.remove(this.cube);
    },
    mainLoop() {
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.mainLoop);
    },
  },
}
</script>
