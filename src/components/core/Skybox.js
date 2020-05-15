import * as THREE from "three";
import LoadManager from "./LoadManager";
import { toRadian } from "../../utils";

export default class {
  constructor(scene, filename) {
    this.scene = scene;
    this.filename = filename;
    this.basePath = './assets/skybox/';
    this.createSky()
  }

  async createSky() {
    const materialArray = await this.createMaterialArray();
    const skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
    this.skybox = new THREE.Mesh(skyboxGeo, materialArray);
    this.skybox.rotateZ(toRadian(180));
    this.skybox.name = 'Skybox';
    this.scene.add(this.skybox);
  }

  /**
   * Create cube material
   * @returns {*}
   */
  async createMaterialArray() {
    const skyboxImagepaths = this.createPathStrings('.png');
    return await Promise.all(skyboxImagepaths.map(async (image) => {
      let texture = await LoadManager.loadTexture(image);
      return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    }));
  }

  /**
   * Import path
   * @param fileType
   * @returns {string[]}
   */
  createPathStrings(fileType = '.jpg') {
    const baseFilename = this.basePath + this.filename + '/' + this.filename;
    const sides = ['ft', 'bk', 'up', 'dn', 'rt', 'lt'];
    return sides.map(side => baseFilename + '_' + side + fileType);
  }
}