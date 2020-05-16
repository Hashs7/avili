import * as THREE from "three/src/Three";
import {Raycaster} from "three/src/Three";
import Projectile from "../../core/Projectile";
import TestimonyManager from "../../core/TestimonyManager";
import {toRadian} from "../../../utils";
import {CircleGradientShader} from "../../shaders/CircleGradientShader";
import CameraOperator from "../../core/CameraOperator";
import gsap from 'gsap';
import AudioManager from "../../core/AudioManager";
import { GAME_STATES } from "../../../constantes";

export default class FieldOfViewManager {
  constructor(world, scene, towers, landingAreas, towerElements, npc, bushes) {
    this.scene = scene;
    this.world = world;
    this.fieldOfView = new THREE.Object3D();
    this.fieldOfViewName = "FieldOfView";
    this.fieldOfViews = [];
    this.fovGeometry = new THREE.CircleGeometry();
    this.lastPosition = new THREE.Vector3();
    this.proj;

    this.index = 0;
    this.towerElements = towerElements;
    this.alreadyHit = false;

    this.npc = npc;
    this.firstNpc = this.npc.find(e => e.group.pseudo === "Daesu").group;
    this.secondNpc = this.npc.find(e => e.group.pseudo === "Tardys").group;
    this.thirdNpc = this.npc.find(e => e.group.pseudo === "Farkana");
    this.fourthNpc = this.npc.find(e => e.group.pseudo === "Schteppe");
    this.isFirstTime = true;

    this.bushes = bushes;

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
    };

    document.addEventListener('stateUpdate', e => {
      if (e.detail === GAME_STATES.words_sequence_start) {
        if(this.proj){
          this.proj.audioEnabled = false;
        }
      }
      if (e.detail !== GAME_STATES.infiltration_sequence_start) return;
      const arr = landingAreas.slice(4);
      this.proj = new Projectile(towers[1], arr, this.scene, this.towerElements[1]);
      this.proj.launchSequence();
      TestimonyManager.speak('infiltration_introduction.mp3', 'infiltration_introduction')
    });

    document.addEventListener('playerMoved', e => {
      const playerPosition = new THREE.Vector3().setFromMatrixPosition(e.detail.matrixWorld);
      this.lastPosition = playerPosition;
    });

    document.addEventListener('showFov', () => {
      this.npc.forEach(({group}, index) => this.addFieldOfView(group, index));
      this.initFirstNpc(this.firstNpc);
      this.initSecondNpc(this.secondNpc);
      this.initThirdNpc();
      this.initFourthNpc();
    });
  }

  setLastPos(position) {
    this.lastPosition = position;
  }

  update() {
    this.towerElements[1].crystal.rotation.y += 0.01;

    if(this.alreadyHit) return;
    this.detectFieldOfView(this.lastPosition);
    if(!this.proj) return;
    this.proj.detectLandingArea(this.lastPosition, this.world, this);
  }

  /**
   * Create new field of view
   * @param group
   * @param index
   */
  addFieldOfView(group, index) {
    this.fovGeometry = new THREE.CircleGeometry(
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
      visible: false,
    });

    const npc = group.children.find(e => e.name = "npc");

    this.fieldOfView = new THREE.Mesh(this.fovGeometry, customMaterial);
    this.fieldOfView.rotateX(toRadian(90));

    this.fieldOfView.position.y += 0.1;
    this.fieldOfView.rotation.z = this.fieldOfView.geometry.parameters.thetaLength / 2;

    this.fieldOfView.name = `${this.fieldOfViewName}-${index}`;
    this.fieldOfViews.push(this.fieldOfView);

    group.add(this.fieldOfView);
  }

  initFirstNpc(firstNpc){
    firstNpc.rotation.y = toRadian(-90);
    const fov = firstNpc.children.find(e => e.name.startsWith("FieldOfView"));
    let geometry = new THREE.CircleGeometry(
      3,
      20,
      0,
      2.6,
    );
    fov.geometry = geometry;
    fov.rotation.z = toRadian(0);
    fov.scale.set(2, 0.8, 0.8);
  }

  initSecondNpc(secondNpc){
    secondNpc.rotation.y = toRadian(-90);
    const tl = gsap.timeline({repeat: -1});
    tl.to(secondNpc.rotation, {
      y: `-=${toRadian(180)}`,
      duration: 2.5,
      delay: 3,
    });
    tl.to(secondNpc.rotation, {
      y: `+=${toRadian(180)}`,
      duration: 2.5,
      delay: 3,
    })
  }

  initThirdNpc(){
    console.log(this.thirdNpc);
    const tl = new gsap.timeline({repeat: -1});
    tl.to(this.thirdNpc.group.rotation, {
      y: `+=${toRadian(0)}`,
      duration: 2,
      delay: 5,
      onComplete : () => {
        this.thirdNpc.moveTo([new THREE.Vector3(97,0, 7)]);
      }
    })
    tl.to(this.thirdNpc.group.rotation, {
      y: `+=${toRadian(0)}`,
      duration: 2,
      delay: 5,
      onComplete : () => {
        this.thirdNpc.moveTo([new THREE.Vector3(100,0, 13)]);
      }
    })
  }

  initFourthNpc(){
    this.fourthNpcFov = this.fourthNpc.group.children.find(e => e.name === "FieldOfView-3");
    this.fourthNpc.group.rotation.y = toRadian(35);
    this.fourthNpcFov.visible = false;
    this.fourthNpcFov.scale.set(1.8, 1.8, 1.8);
    this.fourthNpc.hideNpc();
  }


  /**
   * Detect if player is in field
   * @param position
   */
  detectFieldOfView(position){
    this.player.show();

    const ray = new Raycaster(
      position,
      new THREE.Vector3(0, -1, 0),
      0,
      300,
    );
    const objects = [...this.fieldOfViews, ...this.bushes];
    let objs = ray.intersectObjects(objects, false);
    if(objs.length === 0)return;
    if(objs[objs.length - 1].object.name.startsWith('invisibleArea')){
      this.player.hide();
    } else {
      for (let i = 0; i < objs.length; i++) {
        //console.log(objs[i].object.name);
        if(!objs[i].object.name.startsWith(this.fieldOfViewName)) return;
        this.alreadyHit = true;

        //TestimonyManager.speak('audio_mot_cuisine.mp3');
        const playerModel = this.player.group.children[0];
        this.player.setWalkable(false);
        this.player.setOrientable(false);
        const rotation = Math.atan2( ( this.world.camera.position.x - playerModel.position.x ), ( this.world.camera.position.z - playerModel.position.z ) );
        this.armor().mask.material.transparent = true;
        this.armor().cape.material.transparent = true;

        AudioManager.playSound('npc-angoissant.mp3', false);
        const pseudo = objs[i].object.parent.pseudo;
        document.dispatchEvent(new CustomEvent('npcAudio', { detail: { sequence: 'fov', pseudo }}));
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
            this.fourthNpc.showNpc();
            this.fourthNpcFov.visible = true;
            objs[i].object.name = "Undetectable";
            setTimeout(() => {
              TestimonyManager.speak('infiltration_end.mp3', 'infiltration_end');
            }, 3000);
          } else {
            this.player.teleport(this.world.lastCheckpointCoord, () => {
              this.armor().setOpacity(1);
              this.armor().setVisibility(true)
              this.alreadyHit = false;
            });

            if(objs[i].object.name === "FieldOfView-0" && this.isFirstTime){
              objs[i].object.geometry = this.fovGeometry;
              gsap.to(this.firstNpc.rotation, {
                y: `+=${toRadian(90)}`,
                delay: 2,
                onComplete: () => {this.isFirstTime = false}
              })
              objs[i].object.scale.set(1, 1, 1);
              this.fieldOfViews.forEach(fov => {
                // if(fov.name !== "FieldOfView-3") {
                //   fov.material.visible = true;
                // }
                fov.material.visible = true;
              })
            }
          }
          this.player.setWalkable(true);
          this.player.setOrientable(true);
        });
      }
    }
  }
}
