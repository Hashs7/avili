import Scene from "../Scene";
import gsap from "gsap/gsap-core";
import { GAME_STATES } from "../../../constantes";
import * as THREE from "three";

export default class extends Scene {
  constructor(manager) {
    super();
    this.manager = manager;
    this.scene.name = "FinalScene";

    document.addEventListener('stateUpdate', (e) => {
      if (e.detail !== GAME_STATES.final_black_screen) return;
      this.blackFade();
    });

    return {
      instance: this,
      scene: this.scene,
    }
  }

  blackFade() {
    const player = this.manager.world.getPlayer();
    const tl = gsap.timeline({ repeat: 0 });
    console.log(this.manager.mainScene);
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

    tl.add(gsap.delayedCall(5, () => {
      player.teleport(new THREE.Vector3(0, 0, 0));
      player.addPseudo();
      this.manager.mainScene.fog.near = 45;
    }));

    const color = new THREE.Color(0x96e1ff);

    tl.to(this.manager.mainScene.fog.color, {
      r: color.r,
      g: color.g,
      b: color.b,
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

  update() {}
}
