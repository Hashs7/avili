import Scene from "../Scene";
import FieldOfViewManager from "./FieldOfViewManager";

export default class extends Scene {
  constructor(world, npcPositions, towers, landingAreas, towerEl) {
    super();
    this.scene.name = "FieldOfView";
    this.manager = new FieldOfViewManager(world, this.scene, npcPositions, towers, landingAreas, towerEl);

    return {
      instance: this,
      scene: this.scene,
    }
  }

  update() {
    this.manager.update();
  }
}
