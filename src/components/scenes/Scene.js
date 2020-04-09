import * as THREE from "three";

export default class {
  constructor() {
    this.scene = new THREE.Scene();
  }

  loadScene(gtlf) {
    this.scene = gtlf.scene;
  }

  update() {}
}