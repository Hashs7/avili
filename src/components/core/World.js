import * as THREE from "three/src/Three";
import Stats from 'stats.js'
import CameraOperator from "./CameraOperator";

export default class {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

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
    // let timeStep = (this.renderDelta + this.logicDelta) * this.params.Time_Scale;
    this.update();
    requestAnimationFrame(() => this.render());
    this.stats.end();
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