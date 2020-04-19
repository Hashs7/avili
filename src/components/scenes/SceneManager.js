import LoadManager from '../core/LoadManager';
import * as THREE from "three";
import Skybox from "../core/Skybox";
import { Body, Box, Vec3 } from "cannon-es";
import SpawnScene from "./spawn/SpawnScene";
import FieldOfViewScene from "./fieldOfView/FieldOfViewScene";
import {Raycaster} from "three";
import AudioManager from "../core/AudioManager";

export default class {
  constructor(world, worldPhysic) {
    this.world = world;
    this.worldPhysic = worldPhysic;
    this.scenesPath = './assets/models/scenes/';
    this.loadedScenes = [];
    this.matesPos = [];
    this.mainScene = new THREE.Scene();
    this.initMainScene();

    this.sections = [];
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
      let sectionName = ["sectionInfiltration", "sectionTuto", "sectionHarcelement"];

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

        if (sectionName.includes(child.name)) {
          this.sections.push(child);
        }
      });

      this.detectSectionPassed();

      gltf.scene.children.filter(el => el.name !== 'map');
      map.material = new THREE.MeshPhongMaterial({color: 0xaaaaaa});

      this.mainSceneAddObject(gltf.scene);
      this.mainSceneAddObject(map);
      this.setSpawn();
      this.setFov();
    });
  }

  detectSectionPassed(){
    document.addEventListener('playerMoved', e => {
      const characterMesh = e.detail;
      const characterPosition = new THREE.Vector3().setFromMatrixPosition(e.detail.matrixWorld);

      var direction = new THREE.Vector3( 0, 0, -1 ).applyQuaternion( characterMesh.quaternion );

      const ray = new Raycaster(
        characterPosition,
        direction,
        0,
        0.5,
      );
      const objs = ray.intersectObjects(this.sections, false);

      if(objs.length === 0) return;

      switch (objs[0].object.name) {
        case "sectionTuto" :
          AudioManager.playSound("audio_npc_bougezvous.mp3");
          break;
        case "sectionInfiltration" :
          AudioManager.playSound("audio_info_infiltration.mp3");
          break;
        case "sectionHarcelement" :
          AudioManager.playSound("audio_intro_insulte.mp3");
          break;
      }
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
