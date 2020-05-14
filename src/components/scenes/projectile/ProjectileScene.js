import Scene from "../Scene";
import ProjectileManager from "./ProjectileManager";

export default class extends Scene {
  constructor(towers, landingAreas, world, towerEls) {
    super();
    this.scene.name = "ProjectileScene";
    this.manager = new ProjectileManager(this.scene, towers, landingAreas, world, towerEls);

    return {
      instance: this,
      scene: this.scene,
    }
  }

  update() {
    this.manager.update();
  }
}
