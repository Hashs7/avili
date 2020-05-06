import * as THREE from "three/src/Three";
import {Raycaster} from "three/src/Three";
import AudioManager from "../../core/AudioManager";
import Projectile from "../../core/Projectile";
import TestimonyManager from "../../core/TestimonyManager";

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

    npcPositions.forEach(({x, z}, index) => this.addNPC(x, z, index));

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
      movingFov[i].obj.rotateY(Math.PI / 100);
    }
    this.detectFieldOfView(this.lastPosition);
  }

  addNPC(x, z, index) {
    let geometry = new THREE.SphereGeometry(1, 20, 20);
    let material = new THREE.MeshBasicMaterial({
      color: 0x0000aa,
      transparent: true,
      opacity: 0,
    });
    this.sphere = new THREE.Mesh(geometry, material);
    this.sphere.position.set(x, 0, z);
    this.addFieldOfView(this.sphere, index);
    this.scene.add(this.sphere);
  }

  addFieldOfView(object, index) {
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
    this.fieldOfView.name = `${this.fieldOfViewName}-${index}`;
    this.fieldOfView.position.set(object.position.x, object.position.y - 0.45, object.position.z);

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
