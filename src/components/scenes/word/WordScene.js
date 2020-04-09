import * as THREE from "three/src/Three";
import WordFactory from "./WordFactory";
import Scene from "../Scene";
import { World } from "cannon-es/dist/index";

export default class extends Scene {
  constructor(world, camera) {
    super();
    this.world = world;
    this.scene.name = "WordScene";
    // this.scene.fog = new THREE.Fog(0x202533, -1, 100);
    this.factory = new WordFactory(this.scene, this.world, camera);

    return {
      instance: this,
      scene: this.scene,
    };
  }

  update() {
    this.factory.update();
  }
}