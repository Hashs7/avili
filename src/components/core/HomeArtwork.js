import * as THREE from "three";
import Stats from 'stats.js'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { toRadian } from "../../utils";

export default class {
  constructor(canvas, quality) {
    this.mesh;
    this.statsEnabled = true;
    this.spotLight = new THREE.SpotLight( new THREE.Color(113, 113, 255), 0.05, 0, Math.PI/10);
    this.mouseX = 0;
    this.mouseY = 0;

    this.targetX = 0;
    this.targetY = 0;

    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;

    this.canvas = canvas;
    this.quality = quality;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x292e47 );

    this.camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.01, 30 );
    this.camera.position.set(1.925, -0.52, 6.932);
    this.camera.rotation.y = toRadian(33);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadows = true;

    this.mouseListener = window.addEventListener( 'mousemove', (e) => this.onDocumentMouseMove(e), false );
    this.resizeListener = window.addEventListener('resize', () => this.resize(), { passive: true });
    this.init();
    this.setQuality();
  }

  init() {
    this.scene.add( new THREE.AmbientLight( 0xfefefe, 1));
    // this.scene.add( new THREE.HemisphereLight( 0xfefefe, 0x000000, 10));
    this.scene.fog = new THREE.Fog( 0x292e47, 5, 10);
    this.spotLight.position.set( 5, 10, 7.5 );
    this.spotLight.penumbra = 1;
    this.spotLight.decay = 1;
    this.scene.add( this.spotLight );

    new GLTFLoader().load( "./assets/models/characters/artwork.glb", ( gltf ) => {
      this.createScene(gltf.scene);
    });

    this.render()
  }

  setQuality() {
    switch (this.quality) {
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

  createScene( scene ) {
    /*
    this.mesh = new THREE.Mesh( geometry, material );
    this.mesh.position.y = - 50;
    this.mesh.scale.set( scale, scale, scale );
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.scene.add( this.mesh );
    */
    // this.spotLight.lookAt(scene);
    this.scene.add(scene);
  }

  onDocumentMouseMove( event ) {
    this.mouseX = ( event.clientX - this.windowHalfX );
    this.mouseY = ( event.clientY - this.windowHalfY );
  }

  render() {
    this.targetX = this.mouseX * .0001;
    this.targetY = this.mouseY * .0001;

    if ( this.scene ) {
      this.scene.rotation.y += 0.05 * ( this.targetX - this.scene.rotation.y );
      this.scene.rotation.x += 0.05 * ( this.targetY - this.scene.rotation.x );
    }

    this.renderer.render( this.scene, this.camera );
    this.loop = requestAnimationFrame(() => this.render());
  }

  destroy() {
    cancelAnimationFrame(this.loop);
    this.scene = null;
    this.spotLight = null;
    this.camera = null;
    this.canvas.remove();
    // TODO remove listeners
    // window.removeListener('mousemove', this.mouseListener, { passive: true });
    // window.removeListener('resize', this.resizeListener, { passive: true });
  }

  resize() {
    if (!this.camera) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
  }
}