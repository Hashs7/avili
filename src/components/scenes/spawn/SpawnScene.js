import Scene from "../Scene";
import * as THREE from "three";

export default class extends Scene {
  constructor() {
    super();
    this.scene.name = 'SpawnScene';

    return {
      instance: this,
      scene: this.scene,
    };
  }
}