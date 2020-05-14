import Scene from '../Scene';
import * as THREE from "three";
import TestimonyManager from "../../core/TestimonyManager";
import gsap from 'gsap';
import CameraOperator from "../../core/CameraOperator";

export default class extends Scene {
  constructor(world, spline, sceneManager, spawnCrystal) {
    super();
    this.scene.name = 'SpawnScene';
    this.world = world;
    this.sceneManager = sceneManager;
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
    this.spawnCrystal = spawnCrystal;
    this.upAndDownCrystalAnimation();
    this.initPlayer()

    return {
      instance: this,
      scene: this.scene,
    };
  }

  update() {
    if(!this.spawnCrystal) return;
    this.spawnCrystal.rotation.y += 0.01;
  }

  initPlayer(){
    this.world.player.setWalkable(false);
    this.world.player.setOrientable(false);
    this.world.player.setVisibility(false);
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
        this.sceneManager.npcManager.moveNPC();
      }, 1500)
    });
    // this.world.player.groupCamera();
  }

  playTestimony() {
    // Mettre a false pour jouer la première partie
    // Lorsqu'on appuie sur jouer
    setTimeout(() => {
      TestimonyManager.speak('black_screen.mp3', 'black_screen');
    }, 1000);

    /**
     * Lorsque les coéquipiers apparaissent
     */
    setTimeout(() => {
      TestimonyManager.speak('spawn_mates.mp3', 'spawn_mates');
    }, 8000);

    setTimeout(() => {
      this.sceneManager.npcManager.showNPC();
    }, 5000)

    setTimeout(() => {
      this.sceneManager.npcManager.moveNPC();
    }, 22000)

    setTimeout(() => {
      this.world.player.setVisibility(true);
      this.world.player.getArmor().setVisibility(false);
      this.world.player.getArmor().setOpacity(0);
    }, 30000)

    /**
     * Lorsque la joueuse apparait
     */
    setTimeout(() => {
      TestimonyManager.speak('spawn_player.mp3', 'spawn_player');
      // setTimeout(() => {
      //   this.world.getPlayer().setWalkable(true);
      // }, 7500)
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('npcAudio', { detail: { sequence: 'start' }}));
      }, 6000)
    }, 40000);


    setTimeout(() => {
      const playerModel = this.world.player.group.children[0];
      const rotation = Math.atan2( ( this.world.camera.position.x - playerModel.position.x ), ( this.world.camera.position.z - playerModel.position.z ) );
      const tl = gsap.timeline({repeat: 0});
      tl.to(playerModel.rotation, {
        y: rotation,
        duration: 1,
      })
      tl.to([
        this.world.player.getArmor().mask.material,
        this.world.player.getArmor().cape.material
      ], {
        onStart: () => {this.world.player.getArmor().setVisibility(true);},
        opacity: 1,
        duration: 0.5,
        ease: 'power2.in',
      })
      CameraOperator.zoom(() => {
        this.world.player.setWalkable(true);
        this.world.player.setOrientable(true);
      });
    }, 42000);
    setTimeout(() => {
      this.world.indicationComponent.setIndication('start');
    },45000)
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
