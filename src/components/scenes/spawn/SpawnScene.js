import Scene from '../Scene';
import { Curves } from "three/examples/jsm/curves/CurveExtras";
import * as THREE from "three";

export default class extends Scene {
  constructor(world, spline) {
    super();
    this.scene.name = 'SpawnScene';
    this.world = world;
    this.spline = new THREE.SplineCurve([
      new THREE.Vector3(289.76843686945404, 452.51481137238443, 56.10018915737797),
      new THREE.Vector3(16.577771319586702, 240.23374531404815, -280.3833052451697),
      new THREE.Vector3(-403.04254658266234, 246.80236107858633, 263.6516785694815),
      new THREE.Vector3(-742.5872885993069, 562.7261116761865, 123.47982751001086),
      new THREE.Vector3(-1094.6486616448392, 562.7261116761865, 123.47982751001086)
    ]);



    this.initTravelling();

    return {
      instance: this,
      scene: this.scene,
    };
  }

  initTravelling() {
    console.log(this.spline);
    const geometry = new THREE.TubeGeometry(this.spline);
    const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    const splineObject = new THREE.Line( geometry, material );
    // this.world.cameraOperator.addTube(this.spline);
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
    }, 3000)
  }
}
