import SceneManager from "../scenes/SceneManager";
import SpawnScene from "../scenes/spawn/SpawnScene";
import FieldOfViewScene from "../scenes/fieldOfView/FieldOfViewScene";
import WordScene from "../scenes/word/WordScene";

export class GameManager {
  constructor(world, worldPhysic, camera) {
    this.sceneManager = new SceneManager(worldPhysic);
    // this.sceneManager.addScene(new SpawnScene(world));
    // this.sceneManager.addScene(new FieldOfViewScene());
    // this.sceneManager.addScene(new WordScene(worldPhysic, camera));
  }
}
