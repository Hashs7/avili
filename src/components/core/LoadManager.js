import * as THREE from "three/src/Three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class LoadManager {
  // printProgress = false;
  // loadingTracker = {};
  manager;
  gltfLoader;
  receiver;

  constructor() {
    this.manager = new THREE.LoadingManager();
    this.gltfLoader = new GLTFLoader(this.manager);

    this.manager.onStart = (url, itemsLoaded, itemsTotal) => this.startHandler(url, itemsLoaded, itemsTotal);
    this.manager.onLoad = () => this.loadedHandler();
    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => this.progressHandler( url, itemsLoaded, itemsTotal );
    this.manager.onError = ( url ) => this.errorHandler(url);
  }

  loadGLTF(path, onLoadingFinished) {
    this.gltfLoader.load(path, (gltf) => onLoadingFinished(gltf));
  }

  setReceiver(receiver) {
    this.receiver = receiver;
  }

  startHandler(url, itemsLoaded, itemsTotal) {
    console.log('start ', url, itemsLoaded, itemsTotal);
  }

  loadedHandler() {
  }

  progressHandler( url, itemsLoaded, itemsTotal ) {
    console.log(`${itemsLoaded / itemsTotal * 100 | 0}%`);
    if(!this.receiver) return;
    this.receiver.progressHandler(itemsLoaded / itemsTotal * 100 | 0)
  }

  errorHandler( url ) {
    console.error( 'There was an error loading ' + url );
  }
}

export default new LoadManager();
