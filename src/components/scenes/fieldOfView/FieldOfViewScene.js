import Scene from "../Scene";
import FieldOfViewManager from "./FieldOfViewManager";

export default class extends Scene {
  constructor(npcPositions) {
    super();
    this.scene.name = "FieldOfView";

    console.log("Field of view scene added !");

    this.manager = new FieldOfViewManager(this.scene, npcPositions);

    return {
      instance: this,
      scene: this.scene,
    }
  }

  update() {
    this.manager.update();
  }
}
