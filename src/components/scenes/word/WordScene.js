import WordFactory from "./WordFactory";
import Scene from "../Scene";
import { Vec3 } from "cannon-es";

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
  constructor(world, camera, manager, material) {
    super();
    this.world = world;
    this.scene.name = "WordScene";
    this.wordIndex = 0;
    // this.scene.fog = new THREE.Fog(0x202533, -1, 100);
    //console.log(this.scene);
    this.factory = new WordFactory(this.scene, this.world, camera, manager, material);
    setTimeout(() => {
      this.dropWord()
    }, 2000);
    setTimeout(() => {
      this.dropWord()
    }, 5000);
    setTimeout(() => {
      this.dropWord()
    }, 7000);

    return {
      instance: this,
      scene: this.scene,
    };
  }

  dropWord() {
    this.factory.addWord(wordsDef[this.wordIndex]);
    this.wordIndex++
  }

  update() {
    this.factory.update();
  }
}
