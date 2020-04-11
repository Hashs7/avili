import * as THREE from "three/src/Three";
import {randomInRange} from "../../../utils";
import {Raycaster} from "three/src/Three";

export default class FieldOfViewManager {
  constructor(scene) {
    this.scene = scene;
    this.sphere = new THREE.Object3D();
    this.fieldOfView = new THREE.Object3D();
    this.character = null;

    for (let i = 0; i < 3; i++) {
      this.addNPC(randomInRange(-1000, 1000), randomInRange(-1000, 1000));
    }

    document.addEventListener('characterLoaded', e => {
      this.character = e.detail.character;
    });
  }

  addNPC(x, z) {
    let geometry = new THREE.SphereGeometry(30, 20, 20);
    let material = new THREE.MeshPhongMaterial({
      color: 0x0000aa,
      shininess: 20,
    });
    this.sphere = new THREE.Mesh(geometry, material);
    this.sphere.position.set(x, 0, z);
    this.addFieldOfView(this.sphere);
    this.scene.add(this.sphere);
  }

  addFieldOfView(object) {
    let geometry = new THREE.CylinderGeometry(300, 300, 1, 20, 20);
    let material = new THREE.MeshPhongMaterial({
      color: 0xaa0000,
      opacity: 0.5,
      transparent: true,
    });
    this.fieldOfView = new THREE.Mesh(geometry, material);
    this.fieldOfView.position.set(object.position.x, object.position.y + 1, object.position.z);
    this.scene.add(this.fieldOfView);
  }

  detectFieldOfView(){
    new Raycaster(
      this.character.position,
      new THREE.Vector3(0, -1, 0),
      0,
      300,
    )
  }
}
