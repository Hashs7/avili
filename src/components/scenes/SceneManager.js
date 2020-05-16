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
import { removeObjectOnce } from "../../utils";
import Skybox from "../core/Skybox";

export default class {
  constructor(world, worldPhysic, camera) {
    this.world = world;
    this.worldPhysic = worldPhysic;
    this.camera = camera;
    this.npcManager = new NPCManager(world, this);

    this.mat1 = new Material();

    this.loadedScenes = [];
    this.updateScenes = [];

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
    this.bushes = [];

    this.detectSectionPassed();

    document.addEventListener('stateUpdate', (e) => {
      if (e.detail === GAME_STATES.words_sequence_start) {
        this.ambianceWordsTransition();
        AudioManager.setEndLoopAudio();
        AudioManager.stopIntroLoopAudio();
        AudioManager.stopWindLoopAudio();
      }

      if (e.detail !== GAME_STATES.infiltration_sequence_start) return;
      this.ambianceInfiltrationTransition();
      AudioManager.setWindLoopAudio();
    });
  }

  initMainScene() {
    // new Skybox(this.mainScene, 'cloud');
    this.globalLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
    this.addFloor();
    this.mainScene.add(this.globalLight);
    this.mainScene.fog = new THREE.Fog(0x365799, 30, 40);
    this.mainScene.background = new THREE.Color(0x365799);
    /*setTimeout(() => {
     this.ambianceTransition()
     }, 6000)*/
  }

  ambianceInfiltrationTransition() {
    const nextColor = new THREE.Color(0x111526);
    const duration = 30;
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
      near: 20,
      far: 30,
      duration,
    }, 'start');
  }

  ambianceWordsTransition() {
    const { spotLight } = this.world.getPlayer();

    // const nextColor = new THREE.Color(0x05052b);
    const duration = 15;
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
      near: 10,
      far: 20,
      duration,
    }, 'start');
  }

  /**
   * Add floor on main scene
   */
  addFloor() {
    const geometry = new THREE.BoxGeometry(300, 0.1, 300);
    // const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
    const material = new THREE.MeshBasicMaterial({ visible: false });
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
      if (child.name.startsWith('section')) {
        child.material.transparent = true;
        child.material.opacity = 0;
      }
      if (child.name.split('mate').length > 1) {
        this.npcManager.addMatesPos({ name: child.name, position: child.position });
      }
      if (child.name === 'wall') {
        this.walls = child;
        child.material.visible = false;
        this.colliders.push(child);
      }
      if (child.name === 'npcPath') {
        this.map = child;
      }
      if (child.name === 'Plane_fracturepart1') {
        child.material.vertexColors = false;
        //this.map = child;
      }
      if (child.name === 'NurbsPath') {
        this.spline = child;
      }
      if (sectionName.includes(child.name)) {
        this.sections.push(child);
      }
      if (['m1', 'm2', 'm3', 'm4', 'm5'].includes(child.name)) {
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
      if(child.name === 'fans001') {
        console.log(child);
        var axesHelper = new THREE.AxesHelper( 5 );
        this.fans = child;
        this.fans.add(axesHelper);
      }
      if(child.name === 'Crystal'){
        this.spawnCrystal = child;
      }
      if(child.name.startsWith('invisibleArea')){
        this.bushes.push(child);
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
    this.addScene(new FieldOfViewScene(this.world, this, this.towers, this.landingAreas, this.towerEls, this.npcManager.npcs, this.bushes));
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
        this.startUpdateScene('ProjectileScene');
      }

      if (objs[0].object.name === "sectionInfiltration") {
        this.stopUpdateScene('SpawnScene');
        this.stopUpdateScene('ProjectileScene');
        this.startUpdateScene('FieldOfViewScene');
        state.goToState(GAME_STATES.infiltration_sequence_start)
      }

      if (objs[0].object.name === "sectionHarcelement") {
        this.stopUpdateScene('FieldOfViewScene');
        this.startUpdateScene('WordScene');
        this.startUpdateScene('FinalScene');
        state.goToState(GAME_STATES.words_sequence_start);
      }

      if (objs[0].object.name === "sectionSharing") {
        this.stopUpdateScene('WordScene');
        this.startUpdateScene('SpawnScene');
        AudioManager.stopEndLoopAudio();
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

  addScene(sceneObject) {
    this.loadedScenes.push(sceneObject);
    this.mainScene.add(sceneObject.scene);
    if (sceneObject.scene.name === 'SpawnScene') {
      this.startUpdateScene(sceneObject.scene.name);
    }
  }

  addCollider(object) {
    this.colliders.push(object);
  }

  update(timeStep) {
    this.npcManager.update(timeStep);
    for (let i = 0; i < this.updateScenes.length; i++) {
      this.updateScenes[i].instance.update();
    }
    if (!this.fans) return;
    this.fans.rotateZ(0.01);
    // let invWorldRot = object.getWorldQuaternion(new THREE.Quaternion()).inverse();
    // axis.applyQuaternion(invWorldRot);
    //
    // let deltaLocalRot = new THREE.Quaternion();
    // deltaLocalRot.setFromAxisAngle(axis, radians);
    // object.quaternion.multiply(deltaLocalRot);
  }

  startUpdateScene(sceneName) {
    const newScene = this.loadedScenes.find(({ scene }) => scene.name === sceneName);
    this.updateScenes.push(newScene);
  }

  stopUpdateScene(sceneName) {
    this.updateScenes = removeObjectOnce(this.updateScenes, sceneName);
  }

  destroy() {
    // Dispose all objects
  }
}


//======================================================================
// http://jsfiddle.net/0hoawrkn/
/*function init() {

  scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0x222222));

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.x = 50;
  camera.position.y = -120;
  camera.position.z = 800;
  camera.lookAt(0, 0, 0);
  scene.add(camera);

  //Plane02
  var Plane02Geo = new THREE.PlaneGeometry(450, 450);
  var Plane02Material = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide
  }, {
    color: 0x660000
  });
  Plane02 = new THREE.Mesh(Plane02Geo, Plane02Material);
  Plane02.position.set(0, 0, -120);
  scene.add(Plane02);

  //SPHERES
  var t_Geometry = new THREE.SphereGeometry(10, 20, 20);
  var t_Material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    opacity: 0.8
  });
  t_Material.transparent = true;
  target = new THREE.Mesh(t_Geometry, t_Material);
  scene.add(target);

  var s_Geometry = new THREE.SphereGeometry(15, 20, 20);
  var s1_Material = new THREE.MeshPhongMaterial({
    color: 0x888888
  });
  var s2_Material = new THREE.MeshPhongMaterial({
    color: 0x888888
  });
  var s3_Material = new THREE.MeshPhongMaterial({
    color: 0x888888
  });
  var s4_Material = new THREE.MeshPhongMaterial({
    color: 0x888888
  });

  s1 = new THREE.Mesh(s_Geometry, s1_Material);
  s2 = new THREE.Mesh(s_Geometry, s2_Material);
  s3 = new THREE.Mesh(s_Geometry, s3_Material);
  s4 = new THREE.Mesh(s_Geometry, s4_Material);
  s1.position.set(-140, -80, -120);
  s2.position.set(-90, 140, -120);
  s3.position.set(80, 80, -120);
  s4.position.set(140, -80, -120);
  scene.add(s1);
  scene.add(s2);
  scene.add(s3);
  scene.add(s4);

  //CONE
  wc_geometry = new THREE.CylinderGeometry(3, 40, 120, 40, 10, false);
  //... Following mod is as rec by WestLangley's answer at:-
  //... http://stackoverflow.com/questions/13757483/three-js-lookat-seems-to-be-flipped
  //... LookAt points the object's Z-axis at the target object.
  wc_geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  wc_material = new THREE.MeshPhongMaterial({
    color: 0xffffff
  });
  //wc_material = new THREE.MeshNormalMaterial( );//OK
  //wc_material = new THREE.MeshLambertMaterial( {color: 0x00aaff, side: THREE.DoubleSide} ); //BAD
  worldCone = new THREE.Mesh(wc_geometry, wc_material);
  worldCone.scale.set(0.2, 0.5, 1);
  worldCone.position.set(0, 0, 0);
  var worldCone_axisHelper = new THREE.AxisHelper(100);
  worldCone.add(worldCone_axisHelper);
  scene.add(worldCone);

  //LOCAL BOX

  b_geometry = new THREE.BoxGeometry(60, 50, 40);
  b_material = new THREE.MeshPhongMaterial({
    color: 0xffaa00,
    side: THREE.DoubleSide
  });
  worldBox = new THREE.Mesh(b_geometry, b_material);
  worldBox.position.set(0, -90, 150);
  var worldBox_axisHelper = new THREE.AxisHelper(100);
  worldBox.add(worldBox_axisHelper);
  scene.add(worldBox);

  //LOCAL CONES
  lc_geometry = new THREE.CylinderGeometry(3, 40, 120, 40, 10, false);
  lc_geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));

  lc_material_R = new THREE.MeshPhongMaterial({
    color: 0xff3300,
    side: THREE.DoubleSide
  });
  lc_material_G = new THREE.MeshPhongMaterial({
    color: 0xaaff00,
    side: THREE.DoubleSide
  });
  lc_material_B = new THREE.MeshPhongMaterial({
    color: 0x00aaff,
    side: THREE.DoubleSide
  });

  localCone_R = new THREE.Mesh(lc_geometry, lc_material_R);
  localCone_G = new THREE.Mesh(lc_geometry, lc_material_G);
  localCone_B = new THREE.Mesh(lc_geometry, lc_material_B);

  var localVec_axisHelper_R = new THREE.AxisHelper(100);
  var localVec_axisHelper_G = new THREE.AxisHelper(100);
  var localVec_axisHelper_B = new THREE.AxisHelper(100);

  localCone_R.add(localVec_axisHelper_R);
  localCone_G.add(localVec_axisHelper_G);
  localCone_B.add(localVec_axisHelper_B);

  localCone_R.scale.set(0.2, 0.5, 1);
  localCone_G.scale.set(0.2, 0.5, 1);
  localCone_B.scale.set(0.2, 0.5, 1);

  localCone_R.position.set(80, 0, 0);
  localCone_G.position.set(0, 80, 0);
  localCone_B.position.set(0, 0, 80);

  worldBox.add(localCone_R);
  worldBox.add(localCone_G);
  worldBox.add(localCone_B);


  //ORBIT CONTROLS
}

//======================================================================

function animate() {
  dt = 0.1;
  time += dt;

  requestAnimationFrame(animate);

  SOW_F_Position_Copy_from_vector3_to_Object3D(s1.position, target)


  worldCone.lookAt(target.position); //... Works with the c_geometry rotation.
  var worldVec = new THREE.Vector3();
  //worldVec = target.position.clone(); ///... relative to World Origin(0,0,0)
  //NOPE target.position.copy(worldVec);
  worldVec.copy(target.position).sub(worldCone.position);

  worldBox.rotation.x += 0.01;
  worldBox.rotation.y += 0.03;
  worldBox.rotation.z += 0.02;

  var localVec = new THREE.Vector3();
  localVec = localeDirection(worldBox, worldVec, localVec);

  //=================================================================
  function localeDirection(givenObject, WDV, LDV) {
    givenObject.updateMatrixWorld();

    //FLABBY method: - OK but verbose and excessive object creation
    /!*
     var ob_InvWorldQuaternion = new THREE.Quaternion();
     ob_InvWorldQuaternion = ob_WorldQuaternion.inverse();
     LDV.copy( WDV ).applyQuaternion( ob_InvWorldQuaternion );
     *!/

    //LEAN method: copies WDV value into LDV then applies inverse world quaternion of givenObject.

    LDV.copy(WDV).applyQuaternion(givenObject.getWorldQuaternion().inverse());

    return LDV;
  }
  //=================================================================

  //... Apply localVec
  //... Get the LocalCone to point in the direction of the LocalVec

  var localCone_target_pos = new THREE.Vector3();

  //... LHS becomes sum of two RHS vectors
  localCone_target_pos.addVectors(localCone_G.position, localVec);

  //... ORIENT THE CHILD CONES
  localCone_R.lookAt(1, 0, 0);

  localCone_G.lookAt(localCone_target_pos);

  localCone_B.lookAt(1, 0, 0);
  localCone_B.quaternion.multiply(worldBox.getWorldQuaternion().inverse());
  localCone_B.quaternion.multiply(worldCone.quaternion);


  //... Report to TextBox

  var field = 'myTextField'
  var text1 = //"WorldVec xyz: ( "
    +Math.floor(worldVec.x * 100) / 100 + "," + Math.floor(worldVec.y * 100) / 100 + "," + Math.floor(worldVec.z * 100) / 100 //+")   ";
  var text2 = //"LocalVec xyz: ( "
    +Math.floor(localVec.x * 100) / 100 + "," + Math.floor(localVec.y * 100) / 100 + "," + Math.floor(localVec.z * 100) / 100 //+")";
  var text = text1 + text2;
  //var xxx = F_Update_textbox( field, text); //... superseded by DAT.GUI.

  //... Report to DAT.GUI

  //... METHOD 1 Selective fields updated ...works OK.
  //... METHOD 2 Iterate over all gui controllers...
  //for (var iii in gui.__controllers ) //...

  for (var iii = 0; iii < gui.__controllers.length; iii++) {
    gui.__controllers[iii].updateDisplay();
  }

  //------------------------------------

  renderer.render(scene, camera);

  if (time > 50) time = 0;


}*/
