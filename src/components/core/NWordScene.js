import * as THREE from "three/src/Three";
import WordFactory from "./WordFactory";
import { World } from "cannon-es/dist/index";

export default class NWordScene {
  constructor() {
    this.setup();

    return {
      object: this,
      scene: this.scene,
      camera: this.camera,
      factory: this.factory,
    };
  }

  setup() {
    this.world = new World();
    this.world.gravity.set(0, -50, 0);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x202533, -1, 100);

    this.setCamera();
    this.setLights();
    this.factory = new WordFactory(this.scene, this.world, this.camera);
    // this.renderer.setAnimationLoop(() => { this.draw() })
  }

  setCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    const distance = 15;

    this.camera = new THREE.OrthographicCamera(-distance * aspect, distance * aspect, distance, -distance, -1, 1000)

    this.camera.position.set(-10, 10, 10)
    this.camera.lookAt(new THREE.Vector3())
  }

  setLights() {
    const ambientLight = new THREE.AmbientLight(0xcccccc);
    this.scene.add(ambientLight);

    const foreLight = new THREE.DirectionalLight(0xffffff, 0.5);
    foreLight.position.set(5, 5, 20);
    this.scene.add(foreLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 1);
    backLight.position.set(-5, -5, -10);
    this.scene.add(backLight);
  }

  update() {
    this.updatePhysics();
    // this.renderer.render(this.scene, this.camera)
  }

  updatePhysics() {
    // We need this to synchronize three meshes and Cannon.js rigid bodies
    this.factory.update();
    this.world.step(1 / 60);
  }
}