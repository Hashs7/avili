import SceneManager from "../scenes/SceneManager";
import SpawnScene from "../scenes/spawn/SpawnScene";

export class GameManager {
  constructor() {
    this.sceneManager = new SceneManager();
    // this.sceneManager.loadScene('scene1');
    this.sceneManager.addScene(new SpawnScene());
  }
}