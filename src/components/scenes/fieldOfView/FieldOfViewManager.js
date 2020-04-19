import * as THREE from "three/src/Three";
import {Raycaster} from "three/src/Three";
import AudioManager from "../../core/AudioManager";

export default class FieldOfViewManager {
  constructor(scene, npcPositions) {
    this.scene = scene;
    this.sphere = new THREE.Object3D();
    this.fieldOfView = new THREE.Object3D();
    this.fieldOfViewName = "FieldOfView";
    this.fieldOfViews = [];

    npcPositions.forEach(({ x, z }) => this.addNPC(x, z));
    // for (let i = 0; i < 3; i++) {
    //   this.addNPC(randomInRange(-1000, 1000), randomInRange(-1000, 1000));
    // }

    document.addEventListener('playerMoved', e => {
      const characterPosition = new THREE.Vector3().setFromMatrixPosition(e.detail.matrixWorld);
      this.detectFieldOfView(characterPosition);
    });
  }

  update(){
    if(this.fieldOfViews.length === 0) return;
    this.fieldOfViews.forEach(fieldOfView => {
      fieldOfView.rotateY(Math.PI / 100);
    });
  }

  addNPC(x, z) {
    let geometry = new THREE.SphereGeometry(1, 20, 20);
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
    //let geometry = new THREE.CylinderGeometry(300, 300, 1, 20, 20);
    let geometry = new THREE.CylinderGeometry(
      3,
      3,
      1,
      20,
      1,
      false,
      0,
      1
    );
    let material = new THREE.MeshPhongMaterial({
      color: 0xaa0000,
      opacity: 1,
      transparent: true,
    });
    this.fieldOfView = new THREE.Mesh(geometry, material);
    this.fieldOfView.name = this.fieldOfViewName;
    this.fieldOfView.position.set(object.position.x, object.position.y - 0.45, object.position.z);
    this.fieldOfViews.push(this.fieldOfView);
    this.scene.add(this.fieldOfView);
  }

  detectFieldOfView(position){
    const ray = new Raycaster(
      position,
      new THREE.Vector3(0, -1, 0),
      0,
      300,
    );
    const objs = ray.intersectObjects(this.scene.children, false);

    objs.forEach(obj => {
      if (obj.object.name === this.fieldOfViewName) {
        obj.object.material.color.setHex(0x00aa00);
        AudioManager.playSound("audio_mot_cuisine.mp3");
      }
    });

    if (objs.length === 0){
      this.resetFieldOfViewsColor();
    }
  }

  resetFieldOfViewsColor() {
    this.fieldOfViews.forEach(fieldOfView => {
      fieldOfView.material.color.setHex(0xaa0000);
    });
  }
}