import * as THREE from 'three';
import gsap from 'gsap';

export default class ProjectileManager {
  constructor(scene) {
    this.scene = scene;
    this.projectileLandingArea = new THREE.Object3D();
    this.projectileLandingAreas = [];
    this.projectileBeam = new THREE.Object3D();

    this.addProjectileLandingArea([0, 1, 0]);
  }

  addProjectileLandingArea(position) {
    const geometry = new THREE.CylinderGeometry(1, 1, 1, 20, 20);
    const material = new THREE.MeshPhongMaterial({
      color: 0xaa0000,
      opacity: 0.5,
      transparent: true,
    });
    this.projectileLandingArea = new THREE.Mesh(geometry, material);
    this.projectileLandingArea.position.set(...position);
    this.projectileLandingAreas.push(this.projectileLandingArea);
    this.scene.add(this.projectileLandingArea);

    this.launchSequence();
  }

  addProjectileBeam(originCoord){
    const deltaX = - originCoord[0];
    const deltaY = - originCoord[1];
    const rad = Math.atan2(deltaY, deltaX);

    const geometry = new THREE.CylinderGeometry(5, 5, 1, 20);
    const material = new THREE.MeshPhongMaterial({
      color: 0xaa0000,
      opacity: 0.5,
      transparent: true,
    });

    this.projectileBeam = new THREE.Mesh(geometry, material);
    this.projectileBeam.position.set(...originCoord);
    this.projectileBeam.rotateZ(-rad);

    this.scene.add(this.projectileBeam);
  }

  launchSequence() {
    this.projectileLandingAreas.forEach(element => {
      gsap.to(element.scale, {
        x:100,
        z:100,
        duration: 1,
        delay: 2,
        onComplete: () => {
          this.addProjectileBeam(
            [500, 100, 0],
          );
          gsap.to(this.projectileBeam.scale, {
            y: 2000,
            duration: 1,
          })
        }
      });
    })
  }
}
