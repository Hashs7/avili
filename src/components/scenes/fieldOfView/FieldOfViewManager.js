import * as THREE from "three/src/Three";
import {Raycaster} from "three/src/Three";
import Projectile from "../../core/Projectile";
import TestimonyManager from "../../core/TestimonyManager";
import {toRadian} from "../../../utils";
import {CircleGradientShader} from "../../shaders/CircleGradientShader";
import CameraOperator from "../../core/CameraOperator";
import gsap from 'gsap';

export default class FieldOfViewManager {
  constructor(world, scene, towers, landingAreas, towerElements, npc) {
    this.scene = scene;
    this.world = world;
    this.fieldOfView = new THREE.Object3D();
    this.fieldOfViewName = "FieldOfView";
    this.fieldOfViews = [];
    this.lastPosition = new THREE.Vector3();
    this.proj;

    this.index = 0;
    this.towerElements = towerElements;
    this.alreadyHit = false;

    this.npc = npc;

    this.player = this.world.getPlayer();
    this.armor = () => {
      const armor = {
        mask: null, cape: null,
        setOpacity: value => {
          armor.mask.material.opacity = value;
          armor.cape.material.opacity = value;
        },
        setVisibility: value => {
          armor.mask.material.visible = value;
          armor.cape.material.visible = value;
        }
      }
      this.player.character.traverse(child => {
        if(child.name === 'amask') armor.mask = child;
        if(child.name === 'ahat') armor.cape = child;
      });
      return armor;
    }

    this.npc.forEach(({group}) => this.addFieldOfView(group));

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
    });
  }

  update() {
    this.towerElements[1].crystal.rotation.y += 0.01;

    if(this.alreadyHit) return;
    this.detectFieldOfView(this.lastPosition);
    if(!this.proj) return;
    this.proj.detectLandingArea(this.lastPosition, this.world);
  }

  /**
   * Create new field of view
   * @param x
   * @param z
   * @param index
   */
  addFieldOfView(group) {
    let geometry = new THREE.CircleGeometry(
      3,
      20,
      0,
      1.6,
    );
    const customMaterial = new THREE.ShaderMaterial({
      vertexShader: CircleGradientShader.vertexShader,
      fragmentShader: CircleGradientShader.fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
    })

    const npc = group.children.find(e => e.name = "npc");

    this.fieldOfView = new THREE.Mesh(geometry, customMaterial);
    this.fieldOfView.rotateX(toRadian(90))

    this.fieldOfView.position.y += 0.1;
    this.fieldOfView.rotation.z = this.fieldOfView.geometry.parameters.thetaLength/2;

    this.fieldOfView.name = this.fieldOfViewName;
    this.fieldOfViews.push(this.fieldOfView);

    group.add(this.fieldOfView);
  }

  /**
   * Detect if player is in field
   * @param position
   */
  detectFieldOfView(position){
    const ray = new Raycaster(
      position,
      new THREE.Vector3(0, -1, 0),
      0,
      300,
    );
    let objs = ray.intersectObjects(this.fieldOfViews, false);
    for (let i = 0; i < objs.length; i++) {
      if(!objs[i].object.name.startsWith(this.fieldOfViewName)) return;
      this.alreadyHit = true;

      //TestimonyManager.speak('audio_mot_cuisine.mp3');
      const playerModel = this.player.group.children[0];
      this.player.setWalkable(false);
      this.player.setOrientable(false);
      const rotation = Math.atan2( ( this.world.camera.position.x - playerModel.position.x ), ( this.world.camera.position.z - playerModel.position.z ) );
      this.armor().mask.material.transparent = true;
      this.armor().cape.material.transparent = true;

      // mask, cape and rotation animations
      const tl = gsap.timeline({repeat: 0});
      tl.to(playerModel.rotation, {
        y: rotation,
        duration: 1,
      })
      tl.to([
        this.armor().mask.material,
        this.armor().cape.material
      ], {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          this.armor().setVisibility(false)
        },
      })

      CameraOperator.zoom(() => {
        this.lastPosition = new THREE.Vector3();
        if(objs[i].object.name === "FieldOfView-3") {
          objs[i].object.name = "Undetectable";
          TestimonyManager.speak('infiltration_end.mp3', 'infiltration_end');
        } else {
          this.player.teleport(this.world.lastCheckpointCoord, () => {
            this.armor().setOpacity(1);
            this.armor().setVisibility(true)
            this.alreadyHit = false;
          });
        }
        this.player.setWalkable(true);
        this.player.setOrientable(true);
      });
    }
  }
}
