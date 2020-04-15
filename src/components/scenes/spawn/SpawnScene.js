import Scene from '../Scene';
import { Curves } from "three/examples/jsm/curves/CurveExtras";
import * as THREE from "three";

export default class extends Scene {
  constructor(world) {
    super();
    this.scene.name = 'SpawnScene';
    this.world = world;
    this.initTravelling();

    return {
      instance: this,
      scene: this.scene,
    };
  }

  initTravelling() {
    this.world.cameraOperator.addTube(
      new Curves.GrannyKnot(),
      100,
      true,
      6,
      null,
      10,
      THREE.BackSide,
      0x2194ce
    );
    
    this.world.cameraOperator.setTravelling(true);

    setTimeout(() => {
      this.world.cameraOperator.setTravelling(false);
      this.world.character.groupCamera();
    }, 5000)
  }
}