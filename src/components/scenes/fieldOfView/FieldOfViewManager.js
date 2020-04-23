import * as THREE from "three/src/Three";
import {Raycaster} from "three/src/Three";
import AudioManager from "../../core/AudioManager";

export default class FieldOfViewManager {
  constructor(world, scene, npcPositions) {
    this.scene = scene;
    this.world = world;
    this.sphere = new THREE.Object3D();
    this.fieldOfView = new THREE.Object3D();
    this.fieldOfViewName = "FieldOfView";
    this.fieldOfViews = [];
    this.lastPosition = new THREE.Vector3();

    // for testing
    this.index = 0;


    npcPositions.forEach(({ x, z }) => this.addNPC(x, z));

    document.addEventListener('playerMoved', e => {
      const playerPosition = new THREE.Vector3().setFromMatrixPosition(e.detail.matrixWorld);
      this.lastPosition = playerPosition;
      this.detectFieldOfView(playerPosition);
    });
  }

  update(){
    if(this.fieldOfViews.length === 0) return;
    const movingFov = this.fieldOfViews.filter(fieldOfView => fieldOfView.anime)
    movingFov.forEach(fieldOfView => {
      fieldOfView.obj.rotateY(Math.PI / 100);
    });
    this.detectFieldOfView(this.lastPosition);
  }

  addNPC(x, z) {
    let geometry = new THREE.SphereGeometry(1, 20, 20);
    let material = new THREE.MeshBasicMaterial({
      color: 0x0000aa,
      transparent: true,
      opacity: 0,
    });
    this.sphere = new THREE.Mesh(geometry, material);
    this.sphere.position.set(x, 0, z);
    this.addFieldOfView(this.sphere);
    this.scene.add(this.sphere);
  }

  addFieldOfView(object) {
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
    this.fieldOfView.name = this.fieldOfViewName;
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

    objs.forEach(obj => {
      if (obj.object.name === this.fieldOfViewName) {
        const player = this.world.getplayer();
        player.group.position.copy(this.world.lastCheckpointCoord);
        AudioManager.playSound("audio_mot_cuisine.mp3");
      }
    });
  }
}
