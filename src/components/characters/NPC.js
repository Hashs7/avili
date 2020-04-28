import * as THREE from 'three'
import { makeTextSprite } from "../../utils";
import Character from "./Character";
import { Pathfinding } from "three-pathfinding";

export default class extends Character {
  constructor(gltf, world, sceneManager, name, startPosition, mapGeometry, pseudo) {
    super(gltf, world, sceneManager, name);
    this.speed = 0.2;
    this.isWalking = false;
    this.target = [];
    this.group.name = 'NPC';

    this.group.position.copy(startPosition);
    this.setPathFinding(mapGeometry);
    this.addPseudo(pseudo);
    // this.prepareCrossFade(this.runAction);
  }

  /**
   * init pathfinding
   * @param map
   */
  setPathFinding(map) {
    this.pathfinding = new Pathfinding();
    this.ZONE = 'level1';
    this.pathfinding.setZoneData(this.ZONE, Pathfinding.createZone(map));
  }

  /**
   * Move npc to Vector3
   * @param target
   */
  moveTo(target) {
    const groupID = this.pathfinding.getGroup(this.ZONE, this.group.position);
    this.target = this.pathfinding.findPath(this.group.position, target, this.ZONE, groupID);
    if (!this.target) return;
    this.setWalking(true);
    this.setOrientation(this.target[0]);
  }

  /**
   * Update each frame
   * @param dt
   */
  update() {
    // TODO fix dt
    // this.mixer.update( dt * 10 );
    this.mixer.update( 0.01 );
    if (!this.target || !this.target.length) return;
    const velocity = this.target[0].clone().sub( this.group.position );
    if (velocity.lengthSq() > 0.05 * 0.05) {
      velocity.normalize();
      this.group.position.add( velocity.multiplyScalar( 0.03 ) );
    } else {
      this.target.shift();

      if(this.target.length) {
        this.setOrientation(this.target[0]);
        return;
      }
      this.setWalking(false);
    }
  }

  /**
   * Turn npc orientation with Vector3
   * @param x
   * @param z
   */
  setOrientation({ x, z }) {
    this.character.rotation.y = Math.atan2(x - this.group.position.x, z - this.group.position.z);
  }

  /**
   *
   * @param walk
   */
  setWalking(walk) {
    if (this.isWalking === walk) return;
    // this.prepareCrossFade(this.runAction);
    this.prepareCrossFade(walk ? this.runAction : this.idleAction);
    this.isWalking = walk;
  }

  /**
   * Add npc pseudo
   * @param name
   */
  addPseudo(name) {
    const mesh = this.character.children.find(el => el.name === 'unamed');
    mesh.geometry.computeBoundingBox();
    mesh.material.color = new THREE.Color(0x00aa00);
    mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());
    const playerName = makeTextSprite( ` ${name} `, { fontsize: 20, fontface: "Arial" });
    playerName.position.set(mesh.size.x, mesh.size.y, mesh.size.z);
    this.group.add( playerName );
  }
}
