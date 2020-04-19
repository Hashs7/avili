import * as THREE from "three";
// import { threeToCannon } from 'three-to-cannon';
import { Body, Box, Vec3 } from "cannon-es";
import SpawnScene from "./spawn/SpawnScene";
import FieldOfViewScene from "./fieldOfView/FieldOfViewScene";
import Skybox from "../core/Skybox";
import LoadManager from '../core/LoadManager';
import ProjectileScene from "./projectile/ProjectileScene";

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
    this.towers = [];
    this.landingAreas = []
  }

  initMainScene() {
    new Skybox(this.mainScene, 'afterrain');
    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    //this.addFloor();
    this.addFloor();
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
      const geometry = new THREE.BoxGeometry(300, 0.1, 300);
      const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
      const plane = new THREE.Mesh(geometry, material);
      plane.name = "Floor";
      plane.position.set(80, -0.1 , 50)
      const ground = new Body({
        mass: 0,
        shape: new Box(new Vec3(300, 1, 300)),
        position: new Vec3(0, -1, 0),
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
        if (child.name === 'walls') {
          console.log('wall', child);
          this.setWalls(child);
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
        if(child.name.startsWith('tower')) {
          this.towers.push(child);
        }
        if(child.name.startsWith('z')) {
          this.landingAreas.push(child);
        }
      });

      gltf.scene.children.filter(el => el.name !== 'map');
      map.material = new THREE.MeshPhongMaterial({color: 0xaaaaaa});

      this.mainSceneAddObject(gltf.scene);
      this.mainSceneAddObject(map);
      this.setSpawn();
      this.setFov();
      this.setProjectile();
    });
  }

  setSpawn() {
    this.addScene(new SpawnScene(this.world, this.spline, this.sections));
  }

  setFov() {
    this.addScene(new FieldOfViewScene(this.matesPos, this.world));
  }

  setProjectile() {
    this.addScene(new ProjectileScene(this.towers, this.landingAreas))
  }


  setWalls(object) {
    /*const shape = threeToCannon(object);
    const walls = new Body({
      mass: 0,
      shape,
      position: object.position,
    });
    this.worldPhysic.addBody(walls);*/
  }

  mainSceneAddObject(mesh) {
    this.mainScene.add(mesh);
  }

  addScene(scene) {
    this.loadedScenes.push(scene);
    this.mainScene.add(scene.scene);
  }

  update() {
    for (let i = 0; i < this.loadedScenes.length; i++) {
      this.loadedScenes[i].instance.update();
    }
  }
}
