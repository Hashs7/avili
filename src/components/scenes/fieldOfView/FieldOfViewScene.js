import Scene from "../Scene";
import FieldOfViewManager from "./FieldOfViewManager";

export default class extends Scene {
  constructor(world, manager, npcPositions, towers, landingAreas, towerEl) {
    super();
    this.manager = manager;
    this.scene.name = "FieldOfView";
    this.fov = new FieldOfViewManager(world, this.scene, npcPositions, towers, landingAreas, towerEl);

    return {
      instance: this,
      scene: this.scene,
    }
  }

  update() {
    this.fov.update();
  }
}
