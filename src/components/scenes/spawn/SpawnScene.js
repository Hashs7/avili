import Scene from '../Scene';
import * as THREE from "three";
import {Raycaster} from "three";
import State from "../../core/State";
import TestimonyManager from "../../core/TestimonyManager";
import { GAME_STATES } from "../../../constantes";
import {toRadian} from "../../../utils";
import gsap from 'gsap';

export default class extends Scene {
  constructor(world, spline, sections, finishCallback, spawnCrystal) {
    super();
    this.scene.name = 'SpawnScene';
    this.world = world;
    this.sections = sections;
    this.finishCallback = finishCallback;
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
    this.spawnCrystal = spawnCrystal;
    this.upAndDownCrystalAnimation();

    this.addPortal();

    // Mettre a false pour jouer la première partie
    //TODO Lorsqu'on appuie sur joueur
    setTimeout(() => {
      TestimonyManager.speak('black_screen.mp3', 'black_screen');
    }, 2000)
    //TODO Pendant le travelling
    setTimeout(() => {
      TestimonyManager.speak('travelling.mp3', 'travelling');
    }, 6000)

    //TODO Lorsque les coéquipiers apparaissent
    /*setTimeout(() => {
      TestimonyManager.speak('spawn_mates.mp3', 'spawn_mates');
    }, 28000)

    //TODO Lorsque la joueuse apparait
    setTimeout(() => {
      TestimonyManager.speak('spawn_player.mp3', 'spawn_player');
    }, 65000)*/

    return {
      instance: this,
      scene: this.scene,
    };
  }

  update() {
    if(!this.spawnCrystal) return;
    this.spawnCrystal.rotation.y += 0.01;
  }

  normalize(value, min, max) {
    return (value - min) / (max - min);
  }

  easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  initTravelling() {
    /*const geometry = new THREE.TubeGeometry(this.spline);
    const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    const splineObject = new THREE.Line( geometry, material );*/
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
      new THREE.Vector3( 50, 3, 0 ),
      new THREE.Vector3( 40, 3, -20 ),
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
        this.finishCallback();
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
      sectionSharing: 'audio_npc_bougezvous.mp3',
    };
    document.addEventListener('playerMoved', e => {
      const playerPosition = new THREE.Vector3().setFromMatrixPosition(e.detail.matrixWorld);
      const direction = new THREE.Vector3( 0, 0, -1 ).applyQuaternion( e.detail.quaternion );
      ray.set(playerPosition, direction);
      const objs = ray.intersectObjects(this.sections, true);
      if(objs.length === 0) return;
      const audio = sectionsAudio[objs[0].object.name];
      if (!audio) return;

      playerPosition.y = 0;
      this.world.lastCheckpointCoord = playerPosition;

      const state = new State();

      if (objs[0].object.name === "sectionTuto") {
        state.goToState("projectile_sequence_start");
      }

      if (objs[0].object.name === "sectionInfiltration") {
        state.goToState(GAME_STATES.infiltration_sequence_start)
      }

      if (objs[0].object.name === "sectionHarcelement") {
        state.goToState(GAME_STATES.words_sequence_start);
      }

      if (objs[0].object.name === "sectionSharing") {
        console.log("sharing");
        state.goToState(GAME_STATES.final_teleportation);
        this.addWhiteScreen();
      }

      objs[0].object.name += 'Passed';

      //AudioManager.playSound(audio);
    });
  }

  addPortal() {
    const geometry = new THREE.PlaneBufferGeometry( 1.8, 2.5, 1 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    plane.position.set(11.61, 1.25, 0.18);
    plane.rotation.y = toRadian(90);
    plane.name = "sectionSharing";

    //TODO : Add animated texture
    this.sections.push(plane);
    this.scene.add(plane);
  }

  addWhiteScreen() {
    const geometry = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight, 1 );
    const material = new THREE.MeshBasicMaterial( {
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const plane = new THREE.Mesh( geometry, material );

    gsap.to(plane.material, {
      opacity: 1,
      duration: 2,
    })

    console.log(this.world.player.group);
    this.world.player.group.children[3].add(plane);
    plane.position.set(0, 0, -1);
  }

  upAndDownCrystalAnimation() {
    const tl = gsap.timeline({repeat: -1, yoyo: true});
    tl.to(this.spawnCrystal.position, {
      y: 1.65,
      ease: 'sine.inOut',
      duration: 0.8,
    });
  }
}
