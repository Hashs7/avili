import * as THREE from "three";
import Stats from 'stats.js'
import Konami from 'konami'
import CameraOperator from "./CameraOperator";
import Player from "../characters/Player";
import LoadManager from './LoadManager';
import { NaiveBroadphase, World } from "cannon-es";
import AudioManager from "./AudioManager";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import TestimonyManager from "./TestimonyManager";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import SceneManager from "../scenes/SceneManager";

export default class {
  constructor(canvas, store, pseudo) {
    this.canvas = canvas;
    this.store = store;

    this.indicationComponent = null;
    this.traductor = null;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.localClippingEnabled = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    //this.renderer.setPixelRatio(window.devicePixelRatio);
    //this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.pseudo = pseudo;
    // RenderLoop
    this.clock = new THREE.Clock();
    this.renderDelta = 0;
    this.logicDelta = 0;
    this.sinceLastFrame = 0;

    this.audioManager = AudioManager;
    this.audioManager.initAudio();

    this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.01, 1000);
    this.camera.name = 'MainCamera';

    this.world = new World();
    this.world.gravity.set(0, -60, 0);
    this.world.broadphase = new NaiveBroadphase();
    // Opti cannon
    // this.world.quatNormalizeFast = true;
    // this.world.quatNormalizeSkip = 3;
    // this.world.solver.iterations = 5;

    // this.world.defaultContactMaterial.contactEquationStiffness = 5e6;
    // this.world.defaultContactMaterial.contactEquationRelaxation = 10;

    this.player = null;
    this.lastCheckpointCoord = new THREE.Vector3();

    this.sceneManager = new SceneManager(this, this.world, this.camera);
    this.cameraOperator = CameraOperator;
    CameraOperator.setup(this, this.camera);

    // Stats showing fps
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild( this.stats.dom );

    LoadManager.setLoadedCallback(() => this.render());

    this.loadAssets();
    this.resize();
    // this.setWorker();
    // this.render();
    this.wow();
    //this.debugCamera();
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange(), false);

    // this.setPostProcessing(false);
    this.composer = new EffectComposer(this.renderer);
  }

  loaderFinished() {
    this.sceneManager.spawnScene.instance.playTestimony();
  }


  handleVisibilityChange() {
    if (document.hidden) {
      this.clock.stop()
    } else  {
      this.clock.start()
    }
  }

  setPostProcessing(enable) {
    cancelAnimationFrame(this.loop);
    if (enable) {
      this.renderPostProcessing();
      return;
    }
    this.render();
  }

  setWorker() {
    if (!window.Worker) return;
    this.worker = new Worker('./worker.js');
    this.worker.postMessage({
      some_data: 'foo',
      some_more_data: 'bar'
    });
    this.worker.addEventListener('onmessage', () => {
      // console.log('worker result', e);
    })
  }

  setTestimony(receiver, tr) {
    TestimonyManager.setReceiver(receiver, tr);
  }

  setIndication(receiver, tr) {
    this.indicationComponent = receiver;
    this.traductor = tr;
  }

  /**
   * Load all environement props
   */
  async loadAssets() {
    const assetsDef = [{
      name: 'mapGltf',
      path: './assets/models/map/Map7.glb',
    },{
      name: 't1Gltf',
      path: './assets/models/environment/environment_tower_v2.glb',
    },{
      name: 't2Gltf',
      path: './assets/models/environment/environment_tower_v2.glb',
    },{
      name: 'playerGltf',
      path: './assets/models/characters/personnage_emilie_v10.glb',
    },{
      name: 'npc',
      path: './assets/models/characters/npc.glb'
    }];
    const assets = await Promise.all(assetsDef.map(async ({ name, path }) => {
      const gltf = await LoadManager.loadGLTF(path);
      return { name, gltf };
    }));
    this.appendAssets(assets);
  }

  appendAssets(assets) {
    this.audioManager.loadAudio();
    const playerGltf = assets.find(el => el.name === 'playerGltf').gltf;
    const mapGltf = assets.find(el => el.name === 'mapGltf').gltf;
    const t1Gltf = assets.find(el => el.name === 't1Gltf').gltf;
    const t2Gltf = assets.find(el => el.name === 't2Gltf').gltf;
    this.player = new Player(playerGltf, this.world, this.camera, this.sceneManager, 'Emilie');
    // this.player.groupCamera();
    this.sceneManager.addMap(mapGltf);
    this.sceneManager.addTowers(t1Gltf, t2Gltf);
  }

  getPlayer() {
    return this.player;
  }

  /**
   * Handle logic to update each frame
   * @param timeStep
   */
  update(timeStep) {
    if(this.player) {
      this.player.update(timeStep)
    }
    this.sceneManager.update(timeStep);
    this.cameraOperator.renderFollowCamera();
    this.updatePhysics(timeStep);
  }

  /**
   * Handle physics logic
   * @param timeStep
   */
  updatePhysics(timeStep) {
    this.world.step(timeStep);
  }

  /**
   * Rendering loop
   */
  render() {
    this.stats.begin();
    this.renderDelta = this.clock.getDelta();
    let timeStep = this.renderDelta + this.logicDelta;
    // let timeStep = (this.renderDelta + this.logicDelta) * this.params.Time_Scale;
    this.update(timeStep);
    this.logicDelta = this.clock.getDelta();
    this.renderer.render(this.sceneManager.mainScene, this.camera);
    requestAnimationFrame(() => this.render());
    this.stats.end();
  }

  renderPostProcessing() {
    // this.stats.begin();
    this.renderDelta = this.clock.getDelta();
    let timeStep = this.renderDelta + this.logicDelta;
    // let timeStep = (this.renderDelta + this.logicDelta) * this.params.Time_Scale;
    this.update(timeStep);
    this.logicDelta = this.clock.getDelta();
    this.composer.render();
    this.loop = requestAnimationFrame(() => this.renderPostProcessing());
    // this.stats.end();
  }

  setFollower(el) {
    this.follower = el;
    LoadManager.setUIRefs(el, this.store);
  }

  setQuality(name) {
    switch (name) {
      case 'Basse':
        this.renderer.antialias = false;
        this.renderer.powerPreference  = 'low-power';
        break;

      case 'Moyenne':
        this.renderer.antialias = false;
        this.renderer.powerPreference  = 'default';
        break;

      case 'Élevé':
        this.renderer.antialias = true;
        this.renderer.powerPreference = 'high-performance';
        break;
    }
  }

  debugCamera() {
    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
  }

  /**
   * Wow such a function
   */
  wow() {
    new Konami(() => AudioManager.playSound('ko.mp3', false));
  }

  /**
   * Auto window resize
   */
  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
  }

  /**
   * Destroy all world objects
   */
  destroy() {
    this.clock.stop();
    cancelAnimationFrame(this.loop);
    this.sceneManager.destroy();
    this.player.destroy();
  }
}
