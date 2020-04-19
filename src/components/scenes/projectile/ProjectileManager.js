import * as THREE from 'three';
import gsap from 'gsap';
import {Vector3} from "three";
import {Raycaster} from "three";
import AudioManager from "../../core/AudioManager";

export default class ProjectileManager {
  constructor(scene, towers, landingAreas, world) {
    this.scene = scene;
    this.world = world;
    this.landingAreaName = "LandingArea";

    this.character = this.world.getCharacter();

    const arr = [
      landingAreas.slice(0, 4),
      landingAreas.slice(4)
    ];

    towers.forEach((tower, i) => {
      this.createTower(towers[i].position);
      arr[i].forEach(el => {
        el.position.y = -0.2;
        this.createLandingPoint(el.position);
        this.createProjectileFrom(towers[i].position, el.position);
      });
    });

    document.addEventListener('playerMoved', e => {
      const characterPosition = new THREE.Vector3().setFromMatrixPosition(e.detail.matrixWorld);
      this.detectLandingArea(characterPosition);
    });
  }

  createTower(coord){
    const geometry = new THREE.SphereGeometry( 1, 12, 12 );
    const material = new THREE.MeshBasicMaterial( {
      color: 0xaa0000,
      transparent: true,
      opacity: 0
    });
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.x = coord.x;
    sphere.position.y = coord.y;
    sphere.position.z = coord.z;
    this.scene.add( sphere );
  }

  createProjectileFrom(originCoord, endCoord){
    const direction = new THREE.Vector3().subVectors(originCoord, endCoord);
    const orientation = new THREE.Matrix4();
    orientation.lookAt(originCoord, endCoord, new THREE.Object3D().up);
    orientation.multiply(new THREE.Matrix4().set(
      1, 0, 0, 0,
      0, 0, 1, 0,
      0, -1, 0, 0,
      0, 0, 0, 1
    ));

    const geometry = new THREE.CylinderGeometry( 0.01, 0.01, direction.length(), 10 );
    const material = new THREE.MeshPhongMaterial( {color: 0x00aa00} );
    const cylinder = new THREE.Mesh( geometry, material );

    cylinder.applyMatrix4(orientation);
    cylinder.position.x = (endCoord.x + originCoord.x) / 2;
    cylinder.position.y = (endCoord.y + originCoord.y) / 2;
    cylinder.position.z = (endCoord.z + originCoord.z) / 2;

    this.scene.add( cylinder );
  }

  createLandingPoint(coord){
    const geometry = new THREE.CylinderGeometry( 1, 1, 0.5, 10 );
    const material = new THREE.MeshPhongMaterial( {color: 0x0000aa} );
    const landingPoint = new THREE.Mesh(geometry, material);
    landingPoint.name = this.landingAreaName;

    landingPoint.position.x = coord.x;
    landingPoint.position.y = coord.y;
    landingPoint.position.z = coord.z;

    this.scene.add(landingPoint);
  }

  detectLandingArea(position){
    const ray = new Raycaster(
      position,
      new THREE.Vector3(0, -1, 0),
      0,
      300,
    );
    const objs = ray.intersectObjects(this.scene.children, false);

    objs.forEach(obj => {
      if (obj.object.name === this.landingAreaName) {
        this.character.group.position.copy(this.world.lastCheckpointCoord);
      }
    });
  }

  /*startTimeline(){
    const tl = gsap.timeline({repeat: 1, repeatDelay: 1});
    tl.to(this.landingPoints[0].scale, {
      x: 100,
      z: 100,
      duration: 1,
    })
  }*/
}
