import Scene from "../Scene";
import FieldOfViewManager from "./FieldOfViewManager";

export default class extends Scene {
  constructor() {
    super();
    this.scene.name = "FieldOfView";

    console.log("Field of view scene added !");

    new FieldOfViewManager(this.scene);

    return {
      instance: this,
      scene: this.scene,
    }
  }
}
