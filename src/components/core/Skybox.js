import * as THREE from "three";

export default class {
  constructor(scene, filename) {
    this.scene = scene;
    this.filename = filename;
    this.basePath = './assets/skybox/';

    const materialArray = this.createMaterialArray();
    const skyboxGeo = new THREE.BoxGeometry(8000, 8000, 8000);
    this.skybox = new THREE.Mesh(skyboxGeo, materialArray);
    this.skybox.name = 'Skybox';
    this.scene.add(this.skybox);
  }

  /**
   * Create cube material
   * @returns {*}
   */
  createMaterialArray() {
    const skyboxImagepaths = this.createPathStrings();
    const materialArray = skyboxImagepaths.map(image => {
      let texture = new THREE.TextureLoader().load(image);
      return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    });
    return materialArray;
  }

  /**
   * Import path
   * @param fileType
   * @returns {string[]}
   */
  createPathStrings(fileType = '.jpg') {
    const baseFilename = this.basePath + this.filename;
    const sides = ['ft', 'bk', 'up', 'dn', 'rt', 'lf'];
    return sides.map(side => baseFilename + '_' + side + fileType);
  }
}