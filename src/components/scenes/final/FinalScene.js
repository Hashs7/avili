import Scene from "../Scene";
import gsap from "gsap/gsap-core";
import { GAME_STATES } from "../../../constantes";
import * as THREE from "three";
import {toRadian} from "../../../utils";
import TestimonyManager from "../../core/TestimonyManager";
import LoadManager from "../../core/LoadManager";

export default class extends Scene {
  constructor(manager) {
    super();
    this.manager = manager;
    this.scene.name = "FinalScene";

    document.addEventListener('stateUpdate', (e) => {
      if (e.detail === GAME_STATES.final_black_screen){
        TestimonyManager.speak('ending.mp3', 'ending');
        this.blackFade();
        this.addPortal();
      }
      else if (e.detail === GAME_STATES.final_teleportation){
        const group = this.manager.world.getPlayer().group;

        const pseudo = group.children.find(e => e.name === "pseudo");
        const npc = group.children.find(e => e.name === "npc");
        pseudo.visible = false;
        npc.visible = false;

        this.addWhiteScreen()
      }
    });

    return {
      instance: this,
      scene: this.scene,
    }
  }

  blackFade() {
    const player = this.manager.world.getPlayer();
    const tl = gsap.timeline({ repeat: 0 });
    tl.to(this.manager.globalLight, {
      intensity: 0,
      duration: 1,
    });
    tl.to(player.spotLight, {
      intensity: 0,
      duration: 3,
    });
    tl.to(this.manager.mainScene.fog.color, {
      r:0,
      g:0,
      b:0,
      duration: 1,
    }, 'fadeOut');
    tl.to(this.manager.mainScene.background, {
      r: 0,
      g: 0,
      b: 0,
      duration: 1,
    }, 'fadeOut');
    tl.to(this.manager.mainScene.fog, {
      near: 0,
      duration: 2,
    }, 'fadeOut');

    tl.add(gsap.delayedCall(5, async () => {
      const gltf = await LoadManager.loadGLTF('./assets/models/characters/npc.glb');
      player.changeAppareance(gltf, 'npc');
      player.teleport(new THREE.Vector3(0, 0, 0));
      player.addPseudo();
      this.manager.mainScene.fog.near = 20;
      this.manager.mainScene.fog.far = 30;
    }));

    const color = new THREE.Color(0x96e1ff);

    tl.to(this.manager.mainScene.fog.color, {
      r: color.r,
      g: color.g,
      b: color.b,
      delay: 2,
      duration: 1,
    }, 'fadeIn');
    tl.to(this.manager.mainScene.background, {
      r: color.r,
      g: color.g,
      b: color.b,
      duration: 1,
    }, 'fadeIn');
    tl.to(player.spotLight, {
      intensity: 1,
      duration: 3,
      penumbra: 1,
    }, 'fadeIn');
    tl.to(this.manager.globalLight, {
      intensity: 0.7,
      duration: 5,
    }, 'fadeIn');
  }

  addPortal() {
    const geometry = new THREE.PlaneBufferGeometry( 1.8, 2.5, 1 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    plane.position.set(11.61, 1.25, 0.18);
    plane.rotation.y = toRadian(90);
    plane.name = "sectionSharing";

    //TODO : Add animated texture
    this.manager.addToSection(plane);
    this.scene.add(plane);
  }

  addWhiteScreen() {
    const geometry = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight, 1 );
    const material = new THREE.MeshBasicMaterial( {
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const plane = new THREE.Mesh( geometry, material );
    const camera = this.manager.world.player.group.children.find(e => e.name === "MainCamera")
    camera.add(plane);
    plane.position.set(0, 0,-1);

    gsap.to(plane.material, {
      opacity: 1,
      duration: 2,
      onComplete: () => {
        this.manager.world.store.commit('setFinal', true);
        this.manager.world.destroy();
      }
    });
  }

  update() {}
}
