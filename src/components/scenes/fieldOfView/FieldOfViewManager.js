import * as THREE from "three/src/Three";
import {Raycaster} from "three/src/Three";
import AudioManager from "../../core/AudioManager";
import Projectile from "../../core/Projectile";
import TestimonyManager from "../../core/TestimonyManager";
import {toRadian} from "../../../utils";
import {CircleGradientShader} from "../../shaders/CircleGradientShader";

export default class FieldOfViewManager {
  constructor(world, scene, npcPositions, towers, landingAreas, towerElements) {
    this.scene = scene;
    this.world = world;
    this.sphere = new THREE.Object3D();
    this.fieldOfView = new THREE.Object3D();
    this.fieldOfViewName = "FieldOfView";
    this.fieldOfViews = [];
    this.lastPosition = new THREE.Vector3();
    this.proj;

    this.index = 0;
    this.towerElements = towerElements;
    this.alreadyHit = false;

    npcPositions.forEach(({x, z}, index) => this.addFieldOfView(x, z, index));

    document.addEventListener('stateUpdate', e => {
      if (e.detail !== 'infiltration_sequence_start') return;
      const arr = landingAreas.slice(4);
      this.proj = new Projectile(towers[1], arr, this.scene, this.towerElements[1]);
      this.proj.launchSequence();
      TestimonyManager.speak('infiltration_introduction.mp3', 'infiltration_introduction')
    });

    document.addEventListener('playerMoved', e => {
      const playerPosition = new THREE.Vector3().setFromMatrixPosition(e.detail.matrixWorld);
      this.lastPosition = playerPosition;
      this.detectFieldOfView(playerPosition);
      if(!this.proj) return;
      this.proj.detectLandingArea(playerPosition, this.world);
    });
  }

  update() {
    if(this.fieldOfViews.length === 0) return;
    const movingFov = this.fieldOfViews.filter(fieldOfView => fieldOfView.anime);
    for (let i = 0; i < movingFov.length; i++) {
      movingFov[i].obj.rotateZ(toRadian(1));
    }
    this.detectFieldOfView(this.lastPosition);
  }

  addFieldOfView(x, z, index) {
    //let geometry = new THREE.CylinderGeometry(300, 300, 1, 20, 20);
    let geometry = new THREE.CircleGeometry(
      3,
      20,
      0,
      1.6,
    );
    /*let material = new THREE.MeshBasicMaterial({
      color: 0xaa0000,
      opacity: 1,
      transparent: true,
      side: THREE.DoubleSide,
    });*/
    const customMaterial = new THREE.ShaderMaterial({
      vertexShader: CircleGradientShader.vertexShader,
      fragmentShader: CircleGradientShader.fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
    })

    this.fieldOfView = new THREE.Mesh(geometry, customMaterial);
    this.fieldOfView.name = `${this.fieldOfViewName}-${index}`;
    this.fieldOfView.position.set(x,0.1, z);
    this.fieldOfView.rotateX(toRadian(90))

    this.index++;
    const anime = this.index <= 2;
    this.fieldOfViews.push({obj : this.fieldOfView, anime});

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

    if(this.alreadyHit) return;
    for (let i = 0; i < objs.length; i++) {
      if(!objs[i].object.name.startsWith(this.fieldOfViewName)) return;
      if(objs[i].object.name === "FieldOfView-3") {
        TestimonyManager.speak('infiltration_end.mp3', 'infiltration_end');
        this.alreadyHit = true;
      } else {
        TestimonyManager.speak('audio_mot_cuisine.mp3');
        const player = this.world.getPlayer();
        player.teleport(this.world.lastCheckpointCoord);
      }
    }

    /*
    objs.forEach(obj => {
      if (obj.object.name.startsWith(this.fieldOfViewName)) {
        const player = this.world.getPlayer();
        if(obj.object.name === "FieldOfView-3" && !alreadyHit) {
          console.log("test");
          alreadyHit = true;
          TestimonyManager.speak('infiltration_end.mp3', 'infiltration_end');
        } else {
          player.teleport(this.world.lastCheckpointCoord);
        }
      }
    });*/
  }
}
