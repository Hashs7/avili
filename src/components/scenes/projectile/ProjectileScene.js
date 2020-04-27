import Scene from "../Scene";
import ProjectileManager from "./ProjectileManager";

export default class extends Scene {
  constructor(towers, landingAreas, world) {
    super();
    this.scene.name = "Projectile";
    this.manager = new ProjectileManager(this.scene, towers, landingAreas, world);

    return {
      instance: this,
      scene: this.scene,
    }
  }
}
