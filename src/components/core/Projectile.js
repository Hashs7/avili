import * as THREE from "three";
import {ProjectileShader} from "../shaders/ProjectileShader";
import gsap from "gsap";
import { toRadian } from "../../utils";

export default class Projectile {
  constructor(tower, landingAreas, scene, els) {
    console.log('create, Projectile', els);
    this.tower = tower;
    this.landingAreas = landingAreas;
    this.scene = scene;
    this.landingAreaName = "LandingArea";
    this.projAreaName = "Laser";
    this.uniforms = {
      uSize: {type: 'float', value:  -6.0}
    };
    this.index = 0;
    this.els = els
  }

  launchSequence() {
    this.startTimeline();
  }

  startTimeline() {
    const tl = gsap.timeline({ onComplete: () => {
      this.startTimeline();
    }});
    const currentAngle = Number(this.els.towerTop.rotation.y);
    let pointAngle = Math.atan2(this.tower.position.x - this.landingAreas[this.index].position.x, this.tower.position.z - this.landingAreas[this.index].position.z);
    /*if (pointAngle < 0) {
      pointAngle = pointAngle + (Math.PI * 2)
    }
    const angle = currentAngle + (this.els.towerTop.rotation.y % (Math.PI * 2) - pointAngle);*/

    // console.log('current', this.els.towerTop.rotation.y % (Math.PI * 2));
    // console.log('angle+=', this.els.towerTop.rotation.y + angle);

    tl.to(this.els.towerTop.rotation, {
      onStart: () => {
        this.uniforms.uSize.value = -6.0;
        this.scene.remove(this.scene.getObjectByName("LandingArea"));
        this.scene.remove(this.scene.getObjectByName("Laser"));
        this.landingAreas[this.index].position.y = 0;
        this.createLandingPoint(this.landingAreas[this.index].position);
      },
      y: `${pointAngle}`,
      delay: 1,
      duration: 1.5
    })
    tl.to(this.uniforms.uSize, {
      onStart: () => {
        this.createProjectileFrom(this.tower.position, this.landingAreas[this.index].position);
        this.index = this.index === this.landingAreas.length - 1 ? 0 : this.index + 1;
      },
      value: 6.0,
      delay: 0.5,
      duration: 0.5,
    });
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

    const geometry = new THREE.CylinderGeometry( 0.05, 0.05, direction.length(), 10 );
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: ProjectileShader.vertexShader,
      fragmentShader: ProjectileShader.fragmentShader,
      transparent: true,
    })
    const cylinder = new THREE.Mesh( geometry, material );
    cylinder.name = this.projAreaName;


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

  detectLandingArea(position, world){
    const ray = new THREE.Raycaster(
      position,
      new THREE.Vector3(0, -1, 0),
      0,
      300,
    );
    const objs = ray.intersectObjects(this.scene.children, false);

    objs.forEach(obj => {
      if (obj.object.name === this.landingAreaName) {
        const player = world.getplayer();
        player.group.position.copy(world.lastCheckpointCoord);
      }
    });
  }
}
