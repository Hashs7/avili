import LoadManager from '../core/LoadManager';
import * as THREE from "three";
import Skybox from "../core/Skybox";
import { Body, Box, Vec3 } from "cannon-es";
import SpawnScene from "./spawn/SpawnScene";
import FieldOfViewScene from "./fieldOfView/FieldOfViewScene";

export default class {
  constructor(world, worldPhysic) {
    this.world = world;
    this.worldPhysic = worldPhysic;
    this.scenesPath = './assets/models/scenes/';
    this.loadedScenes = [];
    this.matesPos = [];
    this.mainScene = new THREE.Scene();
    this.initMainScene();
  }

  initMainScene() {
    new Skybox(this.mainScene, 'afterrain');
    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    //this.addFloor();
    this.addMap();
    this.mainScene.add(light);

  }

  /**
   * Add floor on main scene
   */
  addFloor() {
    new THREE.TextureLoader().load('./assets/textures/FloorsCheckerboard_S_Diffuse.jpg', (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.x = 10;
      texture.repeat.y = 10;
      const geometry = new THREE.BoxGeometry(5000, 1, 5000);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const plane = new THREE.Mesh(geometry, material);
      plane.name = "Floor";
      const ground = new Body({
        mass: 0,
        shape: new Box(new Vec3(5000, 1, 5000)),
        position: new Vec3(0, 0, 0)
      });
      this.worldPhysic.addBody(ground);

      this.mainSceneAddObject(plane);
    });
  }

  addMap() {
    LoadManager.loadGLTF('./assets/models/map/map.glb', (gltf) => {
      let map = new THREE.Mesh();
      gltf.scene.traverse((child) => {
        if (child.name.split('mate').length > 1) {
          this.matesPos.push(child.position)
        }
        if (child.name === 'map') {
          map = child;
        }
        if (child.name === 'NurbsPath') {
          this.spline = child;
        }
      });

      gltf.scene.children.filter(el => el.name !== 'map');
      map.material = new THREE.MeshPhongMaterial({color: 0xaa0000});

      this.mainSceneAddObject(gltf.scene);
      this.mainSceneAddObject(map);
      this.setSpawn();
      this.setFov();
    });
  }

  setSpawn() {
    this.addScene(new SpawnScene(this.world, this.spline));
  }

  setFov() {
    this.addScene(new FieldOfViewScene(this.matesPos));
  }

  setScene(scene) {
    this.currentScene = scene;
  }

  mainSceneAddObject(mesh) {
    this.mainScene.add(mesh);
  }

  addScene(scene) {
    this.loadedScenes.push(scene);
    this.mainScene.add(scene.scene);
  }

  loadScene(filename) {
    LoadManager.loadGLTF(`${this.scenesPath}${filename}.glb`, ({ scene }) => {
        scene.name = filename;
        this.loadedScenes.push(scene);
        this.addScene(scene);
      }
    )
  }

  update() {
    this.loadedScenes.forEach(scene => scene.instance.update());
  }
}
