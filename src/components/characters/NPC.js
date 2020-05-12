import * as THREE from 'three'
import { makeTextSprite } from "../../utils";
import Character from "./Character";
import { Pathfinding } from "three-pathfinding";

export default class extends Character {
  constructor(gltf, world, sceneManager, name, startPosition, mapGeometry, pseudo) {
    super(gltf, world, sceneManager, name);
    this.speed = 0.5;
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
    if (!this.target) {
      console.error('Path not found');
      return
    }
    this.setWalking(true);
    this.setOrientation(this.target[0]);
  }

  teleportTo(target) {
    this.group.position.copy(target);
  }

  /**
   * Update each frame
   * @param timeStep
   */
  update(timeStep) {
    this.mixer.update( timeStep );
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

  async addPseudo(name) {
    const playerName = await makeTextSprite(name, { fontsize: 26, fontface: "Roboto Slab" });
    playerName.position.set(0, 1.7, 0);
    this.group.add(playerName);
  }
}
