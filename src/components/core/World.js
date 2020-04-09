import * as THREE from "three/src/Three";
import Stats from 'stats.js'
import CameraOperator from "./CameraOperator";

export default class {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // RenderLoop
    this.clock = new THREE.Clock();
    this.renderDelta = 0;
    this.logicDelta = 0;
    this.sinceLastFrame = 0;

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 8000);
    this.cameraOperator = new CameraOperator(this, this.camera);

    // Stats showing fps
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild( this.stats.dom );

    this.resize();
    this.render()
  }

  /**
   * Handle logic to update each frame
   * @param timeStep
   */
  update(timeStep) {
    this.updatePhysics(timeStep);
    this.cameraOperator.update();
  }

  /**
   * Handle physics logic
   * @param timeStep
   */
  updatePhysics(timeStep) {}

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
    requestAnimationFrame(() => this.render());
    this.stats.end();
  }

  /**
   * Add Object to the world
   * @param object
   */
  add(object) {}

  /**
   * Remove Object to the world
   * @param object
   */
  remove(object) {}

  /**
   * Auto window resize
   */
  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
  }
}