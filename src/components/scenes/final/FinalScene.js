import Scene from "../Scene";
import gsap from "gsap/gsap-core";
import { GAME_STATES } from "../../../constantes";

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
    const { spotLight } = this.manager.world.getPlayer();
    const tl = gsap.timeline({ repeat: 0 });
    console.log(this.manager.mainScene);
    tl.to(this.manager.globalLight, {
      intensity: 0,
      duration: 1,
    });
    tl.to(spotLight, {
      intensity: 0,
      duration: 3,
    });
    tl.to(this.manager.mainScene.fog.color, {
      r:0,
      g:0,
      b:0,
      duration: 1,
    }, 'final');
    tl.to(this.manager.mainScene.background, {
      r: 0,
      g: 0,
      b: 0,
      duration: 1,
    }, 'final');
    tl.to(this.manager.mainScene.fog, {
      near: 0,
      duration: 2,
    }, 'final');

  }

  update() {}
}
