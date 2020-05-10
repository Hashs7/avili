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
      console.log('stateUpdate');
      if (e.detail !== 'projectile_sequence_start') return;
      console.log('launchprojkectile');
      const arr = landingAreas.slice(0, 4);
      this.proj = new Projectile(towers[0], arr, this.scene, this.towerElements[0]);
      this.proj.launchSequence();
    });

    document.addEventListener('playerMoved', e => {
      this.playerPosition = new THREE.Vector3().setFromMatrixPosition(e.detail.matrixWorld);
      if(!this.proj) return
      this.proj.detectLandingArea(this.playerPosition, this.world);
    });
  }

  update() {
    if(!this.proj) return
    this.proj.detectLandingArea(this.playerPosition, this.world);
  }
}
