<template>
  <div id="scenes-selector">
    <ul>
      <li v-for="(scene, index) in scenes" :key="scene.title">
        <button @click="switchScene(index)">
          {{scene.title}}
        </button>
      </li>
    </ul>
    <p v-if="currentScene">{{ currentScene.title }}</p>
  </div>
</template>

<script>
  import LoadManager from "../components/core/LoadManager";
  import * as THREE from "three";

  export default {
    name: 'Game',
    components: {},
    data() {
      return {
        scenes: [{
          title: "Introduction",
          glb: "scene1"
        }, {
          title: "Attaque ennemi",
          glb: "scene2"
        }, {
          title: "Champs de vision",
          glb: "scene3"
        }, {
          title: "Les mots",
          glb: "scene4",
        }],
        currentScene: null,
        currentSceneGlb: null,
        scenesPath: "./assets/models/scenes/"
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.init();
      });
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
    methods: {
      init() {
        this.scene.background = new THREE.Color(0xaaaaaa);
        this.light = new THREE.HemisphereLight(0xffffff, 0x444444);
        this.scene.add(this.light);

        this.currentScene = this.scenes[0];
        // Charger les assets : par défaut la Scene1
        this.loadScene();
        // Démarrer le jeu : GameManager
      },
      switchScene(index) {
        this.currentScene = this.scenes[index];
        this.cleanScene();
        this.loadScene();
      },
      cleanScene() {
        this.scene.remove(this.currentSceneGlb);
        /*this.scene.traverseVisible(child => {
         if (child.type !== 'Scene') {
         this.scene.remove(child);
         }
         });*/
      },
      loadScene() {
        LoadManager.loadGLTF(
          `${this.scenesPath}${this.currentScene.glb}.glb`,
          (gltf) => {
            this.currentSceneGlb = gltf.scene;
            this.scene.add(gltf.scene);
          }
        )
      },
      mainLoop() {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.mainLoop);
      },
    },
  }
</script>

<style scoped>
  #scenes-selector {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 150px;
  }

  #scenes-selector ul {
    padding: 0;
  }

  #scenes-selector button {
    width: 100%;
  }

  #scenes-selector p {
    color: white;
  }
</style>
