import SceneManager from "../scenes/SceneManager";
import SpawnScene from "../scenes/spawn/SpawnScene";
import FieldOfViewScene from "../scenes/fieldOfView/FieldOfViewScene";
import WordScene from "../scenes/word/WordScene";

export class GameManager {
  constructor(world, camera) {
    this.sceneManager = new SceneManager(world);
    //this.sceneManager.loadScene('scene1');
    this.sceneManager.addScene(new SpawnScene());
    this.sceneManager.addScene(new FieldOfViewScene());
    //this.sceneManager.addScene(new WordScene(world, camera));
  }

}
