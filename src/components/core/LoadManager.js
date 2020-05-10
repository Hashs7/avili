import * as THREE from "three/src/Three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { TextureLoader } from "three/src/Three";

class LoadManager {
  constructor() {
    THREE.Cache.enabled = true;
    this.manager = new THREE.LoadingManager();
    this.gltfLoader = new GLTFLoader(this.manager);
    this.textureLoader = new TextureLoader(this.manager);
    this.fontLoader = new THREE.FontLoader(this.manager);
    this.fbxLoader = new FBXLoader();
    this.stlLoader = new STLLoader();
    this.audioLoader = new THREE.AudioLoader(this.manager);
    this.receiver = null;
    this.loadedCallback = null;

    this.manager.onStart = (url, itemsLoaded, itemsTotal) => this.startHandler(url, itemsLoaded, itemsTotal);
    this.manager.onLoad = () => this.loadedHandler();
    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => this.progressHandler( url, itemsLoaded, itemsTotal );
    this.manager.onError = ( url ) => this.errorHandler(url);
  }

  /**
   * Load GLB file
   * @param path
   */
  loadGLTF(path) {
    return new Promise( resolve => this.gltfLoader.load(path, (f) => resolve(f)));
  }

  /**
   * Load FBX file
   * @param path
   */
  loadFBX(path) {
    return new Promise( resolve => this.fbxLoader.load(path, (f) => resolve(f)));
  }

  /**
   * Load FBX file
   * @param path
   */
  loadTexture(path) {
    return new Promise( resolve => this.textureLoader.load(path, (f) => resolve(f)));
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
    if (this.follower) {
      this.follower.leaveFollower();
      this.follower.enable = false;
    }
    if (!this.store || this.store.state.isLoading) return;
    this.store.commit('setLoading', true);
    //console.log('start ', url, itemsLoaded, itemsTotal);
  }

  /**
   *
   * @param el
   */
  setUIRefs(el, store) {
    this.follower = el;
    this.store = store;
  }

  /**
   * Set callback invoke after loader
   * @param fn
   */
  setLoadedCallback(fn) {
    this.loadedCallback = fn;
  }

  /**
   * All elements are loaded
   */
  loadedHandler() {
    if (this.store) {
      console.log('store', this.store);
      this.store.commit('setLoading', false);
    }
    if (this.follower) {
      this.follower.enable = true;
      this.follower.enterFollower();
    }
    if (!this.loadedCallback) return;
    this.loadedCallback();
    this.loadedCallback = null;
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
