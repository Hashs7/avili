import * as THREE from "three";
import { Body, Box, ContactMaterial, Quaternion, Material, Plane, Vec3 } from "cannon-es";
import SpawnScene from "./spawn/SpawnScene";
import FieldOfViewScene from "./fieldOfView/FieldOfViewScene";
import ProjectileScene from "./projectile/ProjectileScene";
import WordScene from "./word/WordScene";
import gsap from 'gsap';
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {OutlinePass} from "three/examples/jsm/postprocessing/OutlinePass";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";
import {GammaCorrectionShader} from "three/examples/jsm/shaders/GammaCorrectionShader";
import {FXAAShader} from "three/examples/jsm/shaders/FXAAShader";
import FinalScene from "./final/FinalScene";
import { GAME_STATES } from "../../constantes";
import {Raycaster} from "three";
import State from "../core/State";
import NPCManager from "./NPCManager";
import AudioManager from '../core/AudioManager';
import { removeItemOnce, removeObjectOnce } from "../../utils";

export default class {
  constructor(world, worldPhysic, camera) {
    this.world = world;
    this.worldPhysic = worldPhysic;
    this.camera = camera;
    this.npcManager = new NPCManager(world, this);

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
    this.spawnCrystal = new THREE.Object3D();

    this.detectSectionPassed();

    document.addEventListener('stateUpdate', (e) => {
      if (e.detail !== GAME_STATES.infiltration_sequence_start) return;
      this.ambianceInfiltrationTransition();
      AudioManager.setWindLoopAudio();
    });
    document.addEventListener('stateUpdate', (e) => {
      if (e.detail !== GAME_STATES.words_sequence_start) return;
      this.ambianceWordsTransition();
    });
  }

  initMainScene() {
    // new Skybox(this.mainScene, 'afterrain');
    this.globalLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
    this.addFloor();
    this.mainScene.add(this.globalLight);
    this.mainScene.fog = new THREE.Fog(0x96e1ff, 45, 50);
    // this.mainScene.fog = new THREE.Fog( 0x96e1ff, 7, 50);
    this.mainScene.background = new THREE.Color(0x96e1ff);
    // this.mainScene.background = new THREE.Color(0xfefefe);
    /*setTimeout(() => {
     this.ambianceTransition()
     }, 6000)*/
  }

  ambianceInfiltrationTransition() {
    const nextColor = new THREE.Color(0x05052b);
    const duration = 15;
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

  ambianceWordsTransition() {
    const { spotLight } = this.world.getPlayer();

    // const nextColor = new THREE.Color(0x05052b);
    const duration = 5;
    const tl = gsap.timeline({ repeat: 0 });
    tl.to(this.globalLight, {
      intensity: 0.1,
      duration,
    }, 'start');
    tl.to(spotLight, {
      angle: Math.PI/12,
      intensity: 0.8,
      penumbra: .3,
      duration,
    }, 'start');
    tl.to(this.mainScene.fog, {
      near: 35,
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
      position: new Vec3(0, -1, 0),
      quaternion: new Quaternion().setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2)
    });
    this.worldPhysic.addBody(groundBody);
    this.worldPhysic.addContactMaterial(mat1_ground);
    this.mainSceneAddObject(plane);
  }

  addMap(gltf) {
    let sectionName = ["sectionInfiltration", "sectionTuto", "sectionHarcelement"];
    gltf.scene.traverse((child) => {
      // console.log(child.name);
      if (child.name.startsWith('section')) {
        child.material.transparent = true;
        child.material.opacity = 0;
      }
      if (child.name.split('mate').length > 1) {
        this.npcManager.addMatesPos(child.position);
      }
      if (child.name === 'wall') {
        this.walls = child;
        child.material.visible = false;
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
        //console.log(child.name);
        this.towers.push(child);
      }
      if(child.name.startsWith('z')) {
        this.landingAreas.push(child);
      }
      if(child.name === 'Crystal'){
        this.spawnCrystal = child;
      }
    });

    gltf.scene.children.filter(el => el.name !== 'map');

    this.mainSceneAddObject(gltf.scene);
    this.setSpawn();
    this.setMap();
    this.setFov();
    this.setProjectile();
    this.setWords();
    this.setFinal();
  }

  addTowers(t1Gltf, t2Gltf){
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

    //this.addGlowEffect([t1.crystal, t2.crystal]);
  }

  addGlowEffect(objects){
    this.world.setPostProcessing(true);

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
    outlinePass.pulsePeriod = 2;

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

  setSpawn() {
    this.spawnScene = new SpawnScene(this.world, this.spline, this, this.spawnCrystal)
    this.addScene(this.spawnScene);
  }

  async setFov() {
    await this.npcManager.loadNPC(this.map);
    this.npcManager.hideNPC();
    this.addScene(new FieldOfViewScene(this.world, this, this.towers, this.landingAreas, this.towerEls, this.npcManager.npcs));
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

  detectSectionPassed() {
    const ray = new Raycaster(
      new THREE.Vector3(0,0,0),
      new THREE.Vector3(0,0,0),
      0,
      0.5,
    );
    ray.firstHitOnly = true;
    const sectionsAudio = {
      sectionTuto: 'audio_npc_bougezvous.mp3',
      sectionInfiltration: 'audio_info_infiltration.mp3',
      sectionHarcelement: 'audio_intro_insulte.mp3',
      sectionSharing: 'audio_npc_bougezvous.mp3',
    };
    document.addEventListener('playerMoved', e => {
      const playerPosition = new THREE.Vector3().setFromMatrixPosition(e.detail.matrixWorld);
      const direction = new THREE.Vector3( 0, 0, -1 ).applyQuaternion( e.detail.quaternion );
      ray.set(playerPosition, direction);
      const objs = ray.intersectObjects(this.sections, true);
      if(objs.length === 0) return;
      const audio = sectionsAudio[objs[0].object.name];
      if (!audio) return;

      playerPosition.y = 0;
      this.world.lastCheckpointCoord = playerPosition;

      const state = new State();

      if (objs[0].object.name === "sectionTuto") {
        state.goToState("projectile_sequence_start");
      }

      if (objs[0].object.name === "sectionInfiltration") {
        this.stopUpdateScene('SpawnScene');
        this.stopUpdateScene('ProjectileScene');
        state.goToState(GAME_STATES.infiltration_sequence_start)
      }

      if (objs[0].object.name === "sectionHarcelement") {
        this.stopUpdateScene('FieldOfViewScene');
        state.goToState(GAME_STATES.words_sequence_start);
      }

      if (objs[0].object.name === "sectionSharing") {
        this.stopUpdateScene('WordScene');
        state.goToState(GAME_STATES.final_teleportation);
      }

      objs[0].object.name += 'Passed';

      //AudioManager.playSound(audio);
    });
  }

  addToSection(section) {
    this.sections.push(section);
  }

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

  update(timeStep) {
    this.npcManager.update(timeStep);
    for (let i = 0; i < this.loadedScenes.length; i++) {
      this.loadedScenes[i].instance.update();
    }
  }

  stopUpdateScene(sceneName) {
    this.loadedScenes = removeObjectOnce(this.loadedScenes, sceneName);
    console.log(sceneName, this.loadedScenes);
  }

  destroy() {
    // Dispose all objects
  }
}
