import WordFactory from "./WordFactory";
import Scene from "../Scene";
import { Vec3 } from "cannon-es";
import * as THREE from "three";
import State from "../../core/State";
import AudioManager from "../../core/AudioManager";
import { Raycaster } from "three";

const wordsDef = [{
  text: 'Kitchen',
  mass: 25,
  position: new Vec3(118, 50, -3),
  collide: false,
}, {
  text: 'Sandwich',
  mass: 30,
  position: new Vec3(125, 50, -5),
  collide: true,
}, {
  text: 'Bitch',
  mass: 20,
  position: new Vec3(132, 70, -3),
  collide: true,
}];

export default class extends Scene {
  constructor(world, camera, manager, material, sections) {
    super();
    this.world = world;
    this.sections = sections;
    this.scene.name = "WordScene";
    this.wordIndex = 0;
    // this.scene.fog = new THREE.Fog(0x202533, -1, 100);
    //console.log(this.scene);
    this.factory = new WordFactory(this.scene, this.world, camera, manager, material);
    this.init();

    return {
      instance: this,
      scene: this.scene,
    };
  }

  init() {
    const ray = new Raycaster(
      new THREE.Vector3(0,0,0),
      new THREE.Vector3(0,0,0),
      0,
      0.5,
    );
    ray.firstHitOnly = true;
    console.log(this.sections);

    document.addEventListener('playerMoved', e => {
      const playerPosition = new THREE.Vector3().setFromMatrixPosition(e.detail.matrixWorld);
      const direction = new THREE.Vector3( 0, 0, -1 ).applyQuaternion( e.detail.quaternion );
      ray.set(playerPosition, direction);
      const objs = ray.intersectObjects(this.sections, false);
      if(objs.length === 0) return;
      console.log('detected');
      if (objs[0].object.name === "m1") {
        this.dropWord();
        objs[0].object.name += 'Passed';
        this.sections.shift();
      }
      if (objs[0].object.name === "m2") {
        this.dropWord();
        objs[0].object.name += 'Passed';
        this.sections.shift();
      }
    });
  }

  dropWord() {
    console.log('dropWord');
    this.factory.addWord(wordsDef[this.wordIndex]);
    this.wordIndex++;
  }

  update() {
    this.factory.update();
  }
}
