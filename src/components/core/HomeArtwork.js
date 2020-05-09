import * as THREE from "three";
import Stats from 'stats.js'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default class {
  constructor(canvas, quality) {
    this.mesh;
    this.statsEnabled = true;
    this.spotLight = new THREE.SpotLight( 0xffffbb, 2 );
    this.mouseX = 0;
    this.mouseY = 0;

    this.targetX = 0;
    this.targetY = 0;

    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;

    this.canvas = canvas;
    this.quality = quality;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x060708 );
    this.camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.z = 1200;
    this.camera.position.y = 200;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;

    this.mouseListener = window.addEventListener( 'mousemove', (e) => this.onDocumentMouseMove(e), false );
    this.resizeListener = window.addEventListener('resize', () => this.resize(), { passive: true });
    this.init();
    this.setQuality();
  }

  init() {
    // LIGHTS
    this.scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );
    this.spotLight.position.set( 0.5, 0, 1 );
    this.spotLight.position.multiplyScalar( 700 );
    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width = 2048;
    this.spotLight.shadow.mapSize.height = 2048;
    this.spotLight.shadow.camera.near = 200;
    this.spotLight.shadow.camera.far = 1500;
    this.spotLight.shadow.camera.fov = 40;
    this.spotLight.shadow.bias = - 0.005;
    this.scene.add( this.spotLight );

    const mapHeight = new THREE.TextureLoader().load( "./assets/models/characters/Infinite-Level_02_Disp_NoSmoothUV-4096.jpg" );

    const material = new THREE.MeshPhongMaterial( {
      color: 0x552811,
      specular: 0x222222,
      shininess: 25,
      bumpMap: mapHeight,
      bumpScale: 12
    } );

    new GLTFLoader().load( "./assets/models/characters/LeePerrySmith.glb", ( gltf ) => {
      this.createScene( gltf.scene.children[ 0 ].geometry, 100, material );
    });


    if ( this.statsEnabled ) {
      this.stats = new Stats();
      document.body.appendChild( this.stats.dom );
    }
    this.render()
  }

  setQuality() {

  }

  createScene( geometry, scale, material ) {
    this.mesh = new THREE.Mesh( geometry, material );
    this.mesh.position.y = - 50;
    this.mesh.scale.set( scale, scale, scale );
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.scene.add( this.mesh );
  }

  onDocumentMouseMove( event ) {
    this.mouseX = ( event.clientX - this.windowHalfX );
    this.mouseY = ( event.clientY - this.windowHalfY );
  }

  render() {
    this.stats.begin();

    this.targetX = this.mouseX * .001;
    this.targetY = this.mouseY * .001;

    if ( this.mesh ) {
      this.mesh.rotation.y += 0.05 * ( this.targetX - this.mesh.rotation.y );
      this.mesh.rotation.x += 0.05 * ( this.targetY - this.mesh.rotation.x );
    }

    this.renderer.render( this.scene, this.camera );
    this.loop = requestAnimationFrame(() => this.render());
    this.stats.end();
  }

  destroy() {
    cancelAnimationFrame(this.loop);
    this.scene = null;
    this.spotLight = null;
    this.camera = null;
    this.canvas.remove();
    // window.removeListener('mousemove', this.mouseListener, { passive: true });
    // window.removeListener('resize', this.resizeListener, { passive: true });
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
  }
}