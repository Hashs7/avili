import * as THREE from 'three'
import { makeTextSprite, toRadian } from "../../utils";
import Character from "./Character";


export default class extends Character {
  constructor(gltf, world, camera, sceneManager, name) {
    super();
  }

  /**
   * Add player pseudo
   * @param sceneManager
   */
  addPseudo(sceneManager) {
    const mesh = this.player.children.find(el => el.name === 'unamed');
    mesh.geometry.computeBoundingBox();
    mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());
    const size = {
      x: mesh.size.x,
      y: mesh.size.y,
      z: mesh.size.z,
    };
    const playerName = makeTextSprite( ` ${name} `, { fontsize: 20, fontface: "Arial" });
    playerName.position.set(size.x, size.y, size.z);
    this.group.add( playerName );
  }
}
