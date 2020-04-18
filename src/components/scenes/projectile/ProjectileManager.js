import * as THREE from 'three';
import gsap from 'gsap';
import {Vector3} from "three";

export default class ProjectileManager {
  constructor(scene) {
    this.scene = scene;
    const towerCoord = new Vector3(0, 200, 0);
    const points = [
      new Vector3(300, 0, 200),
      new Vector3(100, 0, 500),
      new Vector3(-300, 0, 200)
    ];
    this.landingPoints = [];
    this.projectiles = [];


    this.createTower(towerCoord);
    points.forEach(point => {
      this.createProjectileFrom(towerCoord, point);
      this.createLandingPoint(point);
    });
    this.startTimeline();
  }

  createTower(coord){
    const geometry = new THREE.SphereGeometry( 50, 32, 32 );
    const material = new THREE.MeshPhongMaterial( {color: 0xaa0000} );
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

    const geometry = new THREE.CylinderGeometry( 5, 5, direction.length(), 10 );
    const material = new THREE.MeshPhongMaterial( {color: 0x00aa00} );
    const cylinder = new THREE.Mesh( geometry, material );

    cylinder.applyMatrix4(orientation);
    cylinder.position.x = (endCoord.x + originCoord.x) / 2;
    cylinder.position.y = (endCoord.y + originCoord.y) / 2;
    cylinder.position.z = (endCoord.z + originCoord.z) / 2;

    this.projectiles.push(cylinder);
    this.scene.add( cylinder );
  }

  createLandingPoint(coord){
    const geometry = new THREE.CylinderGeometry( 1, 1, 1, 10 );
    const material = new THREE.MeshPhongMaterial( {color: 0x0000aa} );
    const landingPoint = new THREE.Mesh(geometry, material);

    landingPoint.position.x = coord.x;
    landingPoint.position.y = coord.y + 1;
    landingPoint.position.z = coord.z;

    this.landingPoints.push(landingPoint);
    this.scene.add(landingPoint);
  }

  startTimeline(){
    const tl = gsap.timeline({repeat: 1, repeatDelay: 1});
    tl.to(this.landingPoints[0].scale, {
      x: 100,
      z: 100,
      duration: 1,
    })
  }
}
