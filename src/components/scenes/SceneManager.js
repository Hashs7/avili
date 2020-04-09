import LoadManager from '../core/LoadManager';
import * as THREE from "three";
import Skybox from "../core/Skybox";

export default class {
  constructor() {
    this.scenesPath = './assets/models/scenes/';
    this.loadedScenes = [];
    this.mainScene = new THREE.Scene();
    this.initMainScene();
  }

  initMainScene() {
    new Skybox(this.mainScene, 'afterrain');
    const light = new THREE.HemisphereLight(0xffffff, 0x444444)
    this.addFloor();
    this.mainScene.add(light);
  }

  /**
   * Add floor on main scene
   */
  addFloor() {
    new THREE.TextureLoader().load('./assets/textures/FloorsCheckerboard_S_Diffuse.jpg', (texture) => {
      console.log(texture);
      const geometry = new THREE.BoxGeometry(500, 1, 500);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const plane = new THREE.Mesh(geometry, material);
      plane.name = "Floor";
      this.mainSceneAddObject(plane);
    });
  }

  setScene(scene) {
    this.currentScene = scene;
  }

  mainSceneAddObject(mesh) {
    this.mainScene.add(mesh);
  }

  addScene(scene) {
    this.mainScene.add(scene);
  }

  loadScene(filename) {
    LoadManager.loadGLTF(`${this.scenesPath}${filename}.glb`, ({ scene }) => {
        this.loadedScenes.push({ name: filename, scene });
        this.setScene(scene);
      }
    )
  }
}