import * as THREE from "three";
import { Body, Box, ContactMaterial, Quaternion, Material, Plane, Vec3 } from "cannon-es";
import SpawnScene from "./spawn/SpawnScene";
import FieldOfViewScene from "./fieldOfView/FieldOfViewScene";
import LoadManager from '../core/LoadManager';
import ProjectileScene from "./projectile/ProjectileScene";
import NPC from "../characters/NPC";
import WordScene from "./word/WordScene";
import gsap from 'gsap';
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {OutlinePass} from "three/examples/jsm/postprocessing/OutlinePass";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";
import {GammaCorrectionShader} from "three/examples/jsm/shaders/GammaCorrectionShader";
import {FXAAShader} from "three/examples/jsm/shaders/FXAAShader";
import FinalScene from "./final/FinalScene";

const npcsDefinition = (positions) => [{
  name: 'Daesu',
  position: new THREE.Vector3(-1, 0, 2),
  target: new THREE.Vector3(positions[0].x, 0, positions[0].z),
},{
  name: 'Tardys',
  position: new THREE.Vector3(2, 0, -2),
  target: new THREE.Vector3(positions[1].x, 0, positions[1].z),
},{
  name: 'Farkana',
  position: new THREE.Vector3(5, 0, -3),
  target: new THREE.Vector3(positions[2].x, 0, positions[2].z),
},{
  name: 'Schteppe',
  position: new THREE.Vector3(3, 0, 3),
  target: new THREE.Vector3(positions[3].x, 0, positions[3].z),
}];

export default class {
  constructor(world, worldPhysic, camera) {
    this.world = world;
    this.worldPhysic = worldPhysic;
    this.camera = camera;
    this.mat1 = new Material();
    this.scenesPath = './assets/models/scenes/';
    this.loadedScenes = [];
    this.matesPos = [];
    this.mainScene = new THREE.Scene();
    this.initMainScene();

    this.colliders = [];
    this.sections = [];
    this.sectionsWord = [];
    this.npc = [];
    this.towers = [];
    this.towerEls = [];
    this.landingAreas = [];
    this.walls = new THREE.Mesh();
    this.crystals = [];

    setTimeout(() => this.ambianceTransition(), 5000);
  }

  initMainScene() {
    // new Skybox(this.mainScene, 'afterrain');
    this.globalLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
    this.addFloor();
    this.addMap();
    this.mainScene.add(this.globalLight);
    this.mainScene.fog = new THREE.Fog(0x96e1ff, 45, 50);
    // this.mainScene.fog = new THREE.Fog( 0x96e1ff, 7, 50);
    this.mainScene.background = new THREE.Color(0x96e1ff);
    // this.mainScene.background = new THREE.Color(0xfefefe);
    /*setTimeout(() => {
     this.ambianceTransition()
     }, 6000)*/
  }

  ambianceTransition() {
    const nextColor = new THREE.Color(0x05052b);
    const duration = 5;
    const tl = gsap.timeline({ repeat: 0 });
    tl.to(this.globalLight, {
      intensity: 0.2,
      duration,
    }, 'start');
    tl.to(this.mainScene.background, {
      r: nextColor.r,
      g: nextColor.g,
      b: nextColor.b,
      duration,
    }, 'start');
    tl.to(this.mainScene.fog.color, {
      r: nextColor.r,
      g: nextColor.g,
      b: nextColor.b,
      duration,
    }, 'start');
    tl.to(this.mainScene.fog, {
      near: 7,
      duration,
    }, 'start');
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
    const groundMaterial = new Material();
    const mat1_ground = new ContactMaterial(groundMaterial, this.mat1, { friction: 0.0, restitution: 0.0 });
    const groundBody = new Body({
      mass: 0,
      shape: new Plane(),
      material: groundMaterial,
      collisionFilterGroup: 1,
      position: new Vec3(0, -1.1, 0),
      quaternion: new Quaternion().setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2)
    });
    this.worldPhysic.addBody(groundBody);
    this.worldPhysic.addContactMaterial(mat1_ground);
    this.mainSceneAddObject(plane);
  }

  async addMap() {
    const gltf = await LoadManager.loadGLTF('./assets/models/map/map5.glb');
    let sectionName = ["sectionInfiltration", "sectionTuto", "sectionHarcelement"];
    gltf.scene.traverse((child) => {
      if (child.name.startsWith('section')) {
        child.material.transparent = true;
        child.material.opacity = 0;
      }
      if (child.name.split('mate').length > 1) {
        this.matesPos.push(child.position)
      }
      if (child.name === 'wall') {
        this.walls = child;
        this.colliders.push(child);
      }
      if (child.name === 'Plane') {
        this.map = child;
      }
      if (child.name === 'NurbsPath') {
        this.spline = child;
      }
      if (sectionName.includes(child.name)) {
        this.sections.push(child);
      }
      if (['m1', 'm2', 'm3'].includes(child.name)) {
        this.sectionsWord.push(child);
      }
      if(child.name.startsWith('collide')) {
        this.colliders.push(child);
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
    await this.addTowers();
    this.setSpawn();
    this.setMap();
    this.setFov();
    this.setProjectile();
    this.setWords();
    this.setFinal();
  }

  async addTowers(){
    const t1Gltf = await LoadManager.loadGLTF('./assets/models/environment/environment_tower_v1.glb');
    t1Gltf.scene.position.x = this.towers[0].position.x;
    t1Gltf.scene.position.y = this.towers[0].position.y - 10;
    t1Gltf.scene.position.z = this.towers[0].position.z;

    let t1 = {name: "", towerTop: null, crystal: null};
    t1Gltf.scene.traverse(child => {
      if(child.name === "BatimentHaut") t1.towerTop = child;
      if(child.name === "GrosCrystal") t1.crystal = child;
      t1.name = "Tower1";
    });

    this.mainSceneAddObject(t1Gltf.scene);
    this.towerEls.push(t1);

    const t2Gltf = await LoadManager.loadGLTF('./assets/models/environment/environment_tower_v1.glb');
    t2Gltf.scene.position.x = this.towers[1].position.x;
    t2Gltf.scene.position.y = this.towers[1].position.y - 10;
    t2Gltf.scene.position.z = this.towers[1].position.z;

    let t2 = {name: "", towerTop: null, crystal: null};
    t2Gltf.scene.traverse(child => {
      if(child.name === "BatimentHaut") t2.towerTop = child;
      if(child.name === "GrosCrystal") t2.crystal = child;
      t2.name = "Tower2";
    });

    this.mainSceneAddObject(t2Gltf.scene);
    this.towerEls.push(t2);

    this.addGlowEffect([t1.crystal, t2.crystal]);
  }

  addGlowEffect(objects){
    this.world.postProcessing = true;

    const renderPass = new RenderPass(this.mainScene, this.camera);
    this.world.composer.addPass( renderPass );

    const outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), this.mainScene, this.camera );
    this.world.composer.addPass( outlinePass );

    outlinePass.selectedObjects = objects;
    outlinePass.edgeStrength = 8.6;
    outlinePass.edgeGlow = 1;
    outlinePass.edgeThickness = 1.7;
    outlinePass.visibleEdgeColor.set('#ff0202');
    outlinePass.hiddenEdgeColor.set('#ff0202');

    const effectFXAA = new ShaderPass( FXAAShader );
    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
    this.world.composer.addPass( effectFXAA );

    const gammaCorrectionPass = new ShaderPass( GammaCorrectionShader );
    this.world.composer.addPass( gammaCorrectionPass );
  }

  setMap() {
    // this.map.material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    this.mainScene.add(this.map);
  }

  setNPC(map, positions) {
    npcsDefinition(positions).forEach(async (n) => {
      const gltf = await LoadManager.loadGLTF('./assets/models/characters/character-mixamo.glb');
      const npc = new NPC(gltf, this.world, this, 'EMILIE', n.position, map.geometry, n.name);
      this.npc.push(npc);
    });
  }

  moveNPC() {
    setTimeout(() => {
      this.npc.forEach((n, i) => n.moveTo(npcsDefinition(this.matesPos)[i].target));
    }, 3000);
  }

  setSpawn() {
    this.addScene(new SpawnScene(this.world, this.spline, this.sections, () => this.moveNPC()));
  }

  setFov() {
    this.setNPC(this.map, this.matesPos);
    this.addScene(new FieldOfViewScene(this.world, this.matesPos, this.towers, this.landingAreas, this.towerEls));
  }

  setProjectile() {
    this.addScene(new ProjectileScene(this.towers, this.landingAreas, this.world, this.towerEls))
  }

  setWords() {
    this.addScene(new WordScene(this.worldPhysic, this.camera, this, this.mat1, this.sectionsWord))
  }

  setFinal() {
    this.addScene(new FinalScene(this))
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

  addCollider(object) {
    this.colliders.push(object);
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
