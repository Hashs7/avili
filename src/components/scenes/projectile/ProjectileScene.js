import Scene from "../Scene";
import ProjectileManager from "./ProjectileManager";

export default class extends Scene {
  constructor(towers, landingAreas, crystals, world) {
    super();
    this.scene.name = "Projectile";
    this.manager = new ProjectileManager(this.scene, towers, landingAreas, crystals, world);

    return {
      instance: this,
      scene: this.scene,
    }
  }
}
