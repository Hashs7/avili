import * as THREE from "three";
import Stats from 'stats.js'
import Konami from 'konami'
import CameraOperator from "./CameraOperator";
import { GameManager } from "./GameManager";
import Player from "../characters/Player";
import LoadManager from './LoadManager';
import { NaiveBroadphase, World } from "cannon-es";
import AudioManager from "./AudioManager";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import TestimonyManager from "./TestimonyManager";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";

export default class {
  constructor(canvas) {
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    //this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    //this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    // RenderLoop
    this.clock = new THREE.Clock();
    this.renderDelta = 0;
    this.logicDelta = 0;
    this.sinceLastFrame = 0;

    this.audioManager = AudioManager;

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
    this.loadProps();

    this.gameManager = new GameManager(this, this.world, this.camera);
    this.cameraOperator = CameraOperator;
    CameraOperator.setup(this, this.camera);

    // Stats showing fps
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild( this.stats.dom );

    LoadManager.setLoadedCallback(() => this.render());

    this.resize();
    // this.setWorker();
    // this.render();
    this.wow();
    //this.debugCamera()
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange(), false);

    this.setPostProcessing(false);
    this.composer = new EffectComposer(this.renderer);
  }


  handleVisibilityChange() {
    if (document.hidden) {
      this.clock.stop()
    } else  {
      this.clock.start()
    }
  }

  setPostProcessing(enable) {
    console.log('setPostProcessing', enable);
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
    this.worker.addEventListener('onmessage', (e) => {
      console.log('worker result', e);
    })
  }

  setTestimony(receiver, tr) {
    TestimonyManager.setReceiver(receiver, tr);
    /*setTimeout(() => {
      TestimonyManager.speak('blbl.mp3', 'start')
    }, 2000)*/
  }

  /**
   * Load all environement props
   */
  async loadProps() {
    const gltf = await LoadManager.loadGLTF('./assets/models/characters/personnage_emilie_v9.glb');
    this.player = new Player(gltf, this.world, this.camera, this.gameManager.sceneManager, 'Emilie');
    // this.player.groupCamera();
  }

  getPlayer() {
    return this.player;
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
      case 'Haute':
        this.renderer.antialias = true;
        this.renderer.powerPreference = 'high-performance';
        break;
    }
  }


  /**
   * Handle logic to update each frame
   * @param timeStep
   */
  update(timeStep) {
    if(this.player) {
      this.player.update(timeStep)
    }
    this.gameManager.sceneManager.update();
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
    // console.log('render', timeStep);

    // let timeStep = (this.renderDelta + this.logicDelta) * this.params.Time_Scale;
    this.update(timeStep);
    this.logicDelta = this.clock.getDelta();
    this.renderer.render(this.gameManager.sceneManager.mainScene, this.camera);
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

  debugCamera() {
    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
  }

  /**
   * Wow such a function
   */
  wow() {
    new Konami(() => {
      AudioManager.playSound('KO.m4a');
    });
  }

  /**
   * Auto window resize
   */
  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
  }
}
