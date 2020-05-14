import * as THREE from 'three';
import Projectile from "../../core/Projectile";
import { GAME_STATES } from "../../../constantes";


export default class ProjectileManager {
  constructor(scene, towers, landingAreas, world, towerEls) {
    this.scene = scene;
    this.world = world;
    this.proj;
    this.towerElements = towerEls;
    this.lastPosition = new THREE.Vector3();

    document.addEventListener('stateUpdate', e => {
      if (e.detail === GAME_STATES.infiltration_sequence_start && this.proj) {
        this.proj.audioEnabled = false;
      }
      if (e.detail !== GAME_STATES.projectile_sequence_start) return;
      const arr = landingAreas.slice(0, 4);
      this.proj = new Projectile(towers[0], arr, this.scene, this.towerElements[0], this);
      this.proj.launchSequence();
    });

    document.addEventListener('playerMoved', e => {
      this.lastPosition = new THREE.Vector3().setFromMatrixPosition(e.detail.matrixWorld);
    });
  }

  setLastPos(position) {
    this.lastPosition = position;
  }

  update() {
    this.towerElements[0].crystal.rotation.y += 0.01;

    if(!this.proj) return
    this.proj.detectLandingArea(this.lastPosition, this.world, this);
  }
}
