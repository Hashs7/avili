import * as THREE from 'three';
import Projectile from "../../core/Projectile";


export default class ProjectileManager {
  constructor(scene, towers, landingAreas, world, towerEls) {
    this.scene = scene;
    this.world = world;
    this.proj;
    this.towerElements = towerEls;
    this.playerPosition = new THREE.Vector3();

    document.addEventListener('stateUpdate', e => {
      if (e.detail === 'infiltration_sequence_start') {
        this.proj.audioEnabled = false;
      }
      if (e.detail !== 'projectile_sequence_start') return;
      const arr = landingAreas.slice(0, 4);
      this.proj = new Projectile(towers[0], arr, this.scene, this.towerElements[0], this);
      this.proj.launchSequence();
    });

    document.addEventListener('playerMoved', e => {
      this.playerPosition = new THREE.Vector3().setFromMatrixPosition(e.detail.matrixWorld);
    });
  }

  update() {
    this.towerElements[0].crystal.rotation.y += 0.01;

    if(!this.proj) return
    this.proj.detectLandingArea(this.playerPosition, this.world);
  }
}
