import * as THREE from "three";
import { Body, Box, Plane, Vec3 } from "cannon-es";
import SpawnScene from "./spawn/SpawnScene";
import FieldOfViewScene from "./fieldOfView/FieldOfViewScene";
import Skybox from "../core/Skybox";
import LoadManager from '../core/LoadManager';
import ProjectileScene from "./projectile/ProjectileScene";
import NPC from "../characters/NPC";

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
    this.npc = [];
    this.towers = [];
    this.landingAreas = [];
    this.walls = new THREE.Mesh();
  }

  initMainScene() {
    new Skybox(this.mainScene, 'afterrain');
    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    this.addFloor();
    this.addMap();
    this.mainScene.add(light);
  }

  setNPC(map, positions) {
    console.log(positions);
    const npcs = [{
      name: 'xX-Kevin-Du-33-Xx',
      position: new THREE.Vector3(-2, 0, 2),
      target: new THREE.Vector3(positions[0].x, 0, positions[0].z),
    },{
      name: 'Paynis',
      position: new THREE.Vector3(2, 0, -2),
      target: new THREE.Vector3(positions[1].x, 0, positions[1].z),
    },{
      name: 'Dick-hed',
      position: new THREE.Vector3(5, 0, -3),
      target: new THREE.Vector3(positions[2].x, 0, positions[2].z),
    }];
    npcs.forEach(async (n) => {
      const gltf = await LoadManager.loadGLTF('./assets/models/characters/character-mixamo.glb');
      const npc = new NPC(gltf, this.world, this, 'EMILIE', n.position, map.geometry, n.name);
      this.npc.push(npc);
      npc.moveTo(n.target)
    });
  }

  /**
   * Add floor on main scene
   */
  addFloor() {
    const geometry = new THREE.BoxGeometry(300, 0.1, 300);
    const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
    const plane = new THREE.Mesh(geometry, material);
    plane.name = "Floor";
    plane.position.set(80, -0.1 , 50);

    const groundBody = new Body({
      mass: 0,
      shape: new Plane(),
      collisionFilterGroup: 1,
      position: new Vec3(0, 10.1, 0),
    });
    groundBody.quaternion.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);
    this.worldPhysic.addBody(groundBody);
    this.mainSceneAddObject(plane);
  }

  async addMap() {
    const gltf = await LoadManager.loadGLTF('./assets/models/map/map.glb');
    let sectionName = ["sectionInfiltration", "sectionTuto", "sectionHarcelement"];

    gltf.scene.traverse((child) => {
      if (child.name.startsWith('section')) {
        child.material.transparent = true;
        child.material.opacity = 0;
      }

      if (child.name.split('mate').length > 1) {
        this.matesPos.push(child.position)
      }
      if (child.name === 'walls') {
        this.walls = child;
        //this.setWalls(child);
      }
      if (child.name === 'map') {
        this.map = child;
        this.setMap(child);
        //this.setNPC(child);
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

    this.mainSceneAddObject(gltf.scene);
    this.setSpawn();
    this.setFov();
    this.setProjectile();
  }

  async setMap(map) {
    const texture = await LoadManager.loadTexture('./assets/textures/FloorsCheckerboard_S_Diffuse.jpg');
    map.material = new THREE.MeshBasicMaterial({ map: texture });
    map.material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    this.mainSceneAddObject(map);
  }

  setSpawn() {
    this.addScene(new SpawnScene(this.world, this.spline, this.sections));
  }

  setFov() {
    this.setNPC(this.map, this.matesPos);
    this.addScene(new FieldOfViewScene(this.world, this.matesPos));
  }

  setProjectile() {
    this.addScene(new ProjectileScene(this.towers, this.landingAreas, this.world))
  }

  createBoundingBoxShape(object) {
    let shape, localPosition,
      box = new THREE.Box3();

    const clone = object.clone();
    clone.quaternion.set(0, 0, 0, 1);
    clone.updateMatrixWorld();

    box.setFromObject(clone);

    if (!isFinite(box.min.lengthSq())) return null;

    shape = new Box(new Vec3(
      (box.max.x - box.min.x) / 2,
      (box.max.y - box.min.y) / 2,
      (box.max.z - box.min.z) / 2
    ));

    localPosition = box.translate(clone.position.negate()).getCenter(new THREE.Vector3());
    if (localPosition.lengthSq()) {
      shape.offset = localPosition;
    }

    return shape;
  }

  /*setWalls(object) {
    // const directGeo = new THREE.Geometry();
    // directGeo.fromBufferGeometry(object.geometry);
    // const body = generateBody([directGeo], { mass: 6, scale: new THREE.Vector3(1, 1, 1) });
    // console.log(body);
    /!*const shape = threeToCannon(object);
    const walls = new Body({
      mass: 0,
      shape,
      position: object.position,
    });
    this.worldPhysic.addBody(walls);*!/
  }*/

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
    for (let i = 0; i < this.npc.length; i++) {
      this.npc[i].update(this.world.clock.getDelta());
    }
  }
}
