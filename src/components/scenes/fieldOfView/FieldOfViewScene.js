import Scene from "../Scene";
import FieldOfViewManager from "./FieldOfViewManager";

export default class extends Scene {
  constructor(world, manager, towers, landingAreas, towerEl, npc) {
    super();
    this.manager = manager;
    this.scene.name = "FieldOfViewScene";
    this.fov = new FieldOfViewManager(world, this.scene, towers, landingAreas, towerEl, npc);

    return {
      instance: this,
      scene: this.scene,
    }
  }

  update() {
    this.fov.update();
  }
}
