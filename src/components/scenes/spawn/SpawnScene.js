import Scene from '../Scene';
import { Curves } from "three/examples/jsm/curves/CurveExtras";
import * as THREE from "three";
import {Raycaster} from "three";
import AudioManager from "../../core/AudioManager";
import LoadManager from "../../core/LoadManager";
import State from "../../core/State";

export default class extends Scene {
  constructor(world, spline, sections) {
    super();
    this.scene.name = 'SpawnScene';
    this.world = world;
    this.sections = sections;
    this.spline = new THREE.SplineCurve([
      new THREE.Vector3(289.76843686945404, 452.51481137238443, 56.10018915737797),
      new THREE.Vector3(16.577771319586702, 240.23374531404815, -280.3833052451697),
      new THREE.Vector3(-403.04254658266234, 246.80236107858633, 263.6516785694815),
      new THREE.Vector3(-742.5872885993069, 562.7261116761865, 123.47982751001086),
      new THREE.Vector3(-1094.6486616448392, 562.7261116761865, 123.47982751001086)
    ]);
    this.world.player.groupCamera();
    /*setTimeout(() => {
      // TODO set after load manager finished
      this.initTravelling();
    }, 5000);*/
    this.detectSectionPassed();

    return {
      instance: this,
      scene: this.scene,
    };
  }

  initTravelling() {
    const geometry = new THREE.TubeGeometry(this.spline);
    const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    const splineObject = new THREE.Line( geometry, material );
    // this.world.cameraOperator.addTube(this.spline);
    /*this.world.cameraOperator.addTube(
      new Curves.GrannyKnot(),
      100,
      true,
      6,
      null,
      10,
      THREE.BackSide,
      0x2194ce
    );*/

    const spline = new THREE.CatmullRomCurve3( [
      new THREE.Vector3(150, 3, 0),
      new THREE.Vector3(90, 3, 0),
      new THREE.Vector3( 80, 3, 20 ),
      new THREE.Vector3( 30, 3, 0 ),
      new THREE.Vector3( 20, 3, -20 ),
      new THREE.Vector3( 10, 2, 5 ),
      new THREE.Vector3(-9, 6.5, 5.8)
    ]);
    spline.name = 'spline';

    this.world.cameraOperator.addTube(spline);
    this.world.cameraOperator.setTravelling(true);
    this.world.cameraOperator.setCallback(() => {
      setTimeout(() => {
        this.world.cameraOperator.setTravelling(false);
        this.world.player.groupCamera();
      }, 1500)
    });
    // this.world.player.groupCamera();
  }

  detectSectionPassed(){
    const ray = new Raycaster(
      new THREE.Vector3(0,0,0),
      new THREE.Vector3(0,0,0),
      0,
      0.5,
    );
    ray.firstHitOnly = true;
    const sectionsAudio = {
      sectionTuto: 'audio_npc_bougezvous.mp3',
      sectionInfiltration: 'audio_info_infiltration.mp3',
      sectionHarcelement: 'audio_intro_insulte.mp3',
    };
    document.addEventListener('playerMoved', e => {
      const playerPosition = new THREE.Vector3().setFromMatrixPosition(e.detail.matrixWorld);
      const direction = new THREE.Vector3( 0, 0, -1 ).applyQuaternion( e.detail.quaternion );
      ray.set(playerPosition, direction);
      const objs = ray.intersectObjects(this.sections, false);
      if(objs.length === 0) return;
      const audio = sectionsAudio[objs[0].object.name];
      if (!audio) return;
      objs[0].object.name += 'Passed';

      playerPosition.y = 0;
      this.world.lastCheckpointCoord = playerPosition;

      const state = new State();

      if(objs[0].object.name === "sectionTutoPassed") {
        state.goToState("projectile_sequence_start");
      }

      if(objs[0].object.name === "sectionInfiltrationPassed") {
        state.goToState("infiltration_sequence_start")
      }

      AudioManager.playSound(audio);
    });
  }
}
