import Scene from "../Scene";
import ProjectileManager from "./ProjectileManager";

export default class extends Scene {
  constructor() {
    super();
    this.scene.name = "Projectile";

    console.log("🎥 Projectile scene added !");

    this.manager = new ProjectileManager(this.scene);

    return {
      instance: this,
      scene: this.scene,
    }
  }
}
