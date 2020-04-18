import Scene from '../Scene';
import { Curves } from "three/examples/jsm/curves/CurveExtras";
import * as THREE from "three";

export default class extends Scene {
  constructor(world, spline) {
    super();
    this.scene.name = 'SpawnScene';
    this.world = world;
    this.spline = spline;
    // this.initTravelling();

    return {
      instance: this,
      scene: this.scene,
    };
  }

  initTravelling() {
    console.log(this.spline);
    this.world.cameraOperator.addGeometry(this.spline);
    this.world.cameraOperator.setTravelling(true);

    setTimeout(() => {
      this.world.cameraOperator.setTravelling(false);
      // this.world.character.groupCamera();
    }, 3000)
  }
}
