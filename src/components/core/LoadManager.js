import * as THREE from "three/src/Three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

class LoadManager {
  constructor() {
    THREE.Cache.enabled = true;
    this.manager = new THREE.LoadingManager();
    this.gltfLoader = new GLTFLoader(this.manager);
    this.fontLoader = new THREE.FontLoader(this.manager);
    this.fbxLoader = new FBXLoader();
    this.stlLoader = new STLLoader();
    this.audioLoader = new THREE.AudioLoader(this.manager);

    this.manager.onStart = (url, itemsLoaded, itemsTotal) => this.startHandler(url, itemsLoaded, itemsTotal);
    this.manager.onLoad = () => this.loadedHandler();
    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => this.progressHandler( url, itemsLoaded, itemsTotal );
    this.manager.onError = ( url ) => this.errorHandler(url);
  }

  /**
   * Load GLB file modele
   * @param path
   * @param onLoadingFinished
   */
  loadGLTF(path, onLoadingFinished) {
    this.gltfLoader.load(path, (gltf) => onLoadingFinished(gltf));
  }

  /**
   * Load FBX file
   * @param path
   * @param onLoadingFinished
   */
  loadFBX(path, onLoadingFinished) {
    this.fbxLoader.load(path, (f) => onLoadingFinished(f));
  }

  /**
   * Load STL binary file
   * @param path
   * @param onLoadingFinished
   */
  loadSTL(path, onLoadingFinished) {
    this.stlLoader.load(path, (f) => onLoadingFinished(f));
  }

  /**
   * Load custom json file font
   * @param path
   * @param onLoadingFinished
   */
  loadFont(path, onLoadingFinished) {
    this.fontLoader.load(path, (f) => onLoadingFinished(f));
  }

  /**
   * Load audio file
   * @param path
   * @param onLoadingFinished
   */
  loadAudio(path, onLoadingFinished) {
    this.audioLoader.load(path, (f) => onLoadingFinished(f));
  }

  /**
   * Set receiver of all handlers
   * @param receiver
   */
  setReceiver(receiver) {
    this.receiver = receiver;
  }

  /**
   * Start loading
   * @param url
   * @param itemsLoaded
   * @param itemsTotal
   */
  startHandler(url, itemsLoaded, itemsTotal) {
    //console.log('start ', url, itemsLoaded, itemsTotal);
  }

  /**
   * All elements are loaded
   */
  loadedHandler() {
  }

  /**
   * Update loader progress
   * @param url
   * @param itemsLoaded
   * @param itemsTotal
   */
  progressHandler( url, itemsLoaded, itemsTotal ) {
    //console.log(`${itemsLoaded / itemsTotal * 100 | 0}%`);
    if(!this.receiver) return;
    this.receiver.progressHandler(itemsLoaded / itemsTotal * 100 | 0)
  }

  /**
   * Handle error on load
   * @param url
   */
  errorHandler(url) {
    console.error( 'There was an error loading ' + url );
  }
}

export default new LoadManager();
