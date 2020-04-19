import Scene from "../Scene";
import ProjectileManager from "./ProjectileManager";

export default class extends Scene {
  constructor(towers, landingAreas) {
    super();
    this.scene.name = "Projectile";

    console.log("🎥 Projectile scene added !");

    this.manager = new ProjectileManager(this.scene, towers, landingAreas);

    return {
      instance: this,
      scene: this.scene,
    }
  }
}
