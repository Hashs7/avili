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

export default class {
  constructor(canvas) {
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // RenderLoop
    this.clock = new THREE.Clock();
    this.renderDelta = 0;
    this.logicDelta = 0;
    this.sinceLastFrame = 0;

    this.audioManager = AudioManager;

    this.camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 8000);
    this.camera.name = 'MainCamera';

    this.world = new World();
    this.world.gravity.set(0, -50, 0);
    this.world.broadphase = new NaiveBroadphase();

    this.player = null;
    this.lastCheckpointCoord = new THREE.Vector3();
    this.loadProps();

    this.gameManager = new GameManager(this, this.world, this.camera);
    this.cameraOperator = new CameraOperator(this, this.camera);

    // Stats showing fps
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild( this.stats.dom );


    this.resize();
    this.render();
    this.wow();
    this.debugCamera();
  }

  /**
   * Load all environement props
   */
  async loadProps() {
    const gltf = await LoadManager.loadGLTF('./assets/models/characters/character-mixamo.glb');
    this.player = new Player(gltf, this.world, this.camera, this.gameManager.sceneManager, 'EMILIE');
    this.player.groupCamera();
  }

  getplayer(){
    return this.player;
  }


  /**
   * Handle logic to update each frame
   * @param timeStep
   */
  update(timeStep) {
    if(this.player) {
      this.player.update()
    }
    this.gameManager.sceneManager.update();
    this.cameraOperator.renderFollowCamera();
    this.updatePhysics(timeStep);
    // this.cameraOperator.update();
  }

  /**
   * Handle physics logic
   * @param timeStep
   */
  updatePhysics(timeStep) {
    this.world.step(1 / 60);
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
    this.renderer.render(this.gameManager.sceneManager.mainScene, this.camera);
    requestAnimationFrame(() => this.render());
    this.stats.end();
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
