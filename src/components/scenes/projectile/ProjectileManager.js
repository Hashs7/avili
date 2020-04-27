import * as THREE from 'three';
import Projectile from "../../core/Projectile";


export default class ProjectileManager {
  constructor(scene, towers, landingAreas, crystals, world) {
    this.scene = scene;
    this.world = world;
    this.landingAreaName = "LandingArea";

    document.addEventListener('stateUpdate', e => {
      if (e.detail !== 'projectile_sequence_start') return;

      const arr = landingAreas.slice(0, 4);
      const proj = new Projectile(towers[0], arr, this.scene);
      proj.launchSequence();
    })

    document.addEventListener('playerMoved', e => {
      const playerPosition = new THREE.Vector3().setFromMatrixPosition(e.detail.matrixWorld);
      this.detectLandingArea(playerPosition);
    });
  }


  detectLandingArea(position){
    const ray = new THREE.Raycaster(
      position,
      new THREE.Vector3(0, -1, 0),
      0,
      300,
    );
    const objs = ray.intersectObjects(this.scene.children, false);

    objs.forEach(obj => {
      if (obj.object.name === this.landingAreaName) {
        const player = this.world.getplayer();
        player.group.position.copy(this.world.lastCheckpointCoord);
      }
    });
  }
}
