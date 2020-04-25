import * as THREE from 'three'
import { makeTextSprite, toRadian } from "../../utils";
import Character from "./Character";
import { Pathfinding } from "three-pathfinding";

export default class extends Character {
  constructor(gltf, world, sceneManager, name, startPosition, mapGeometry) {
    super(gltf, world, sceneManager, name);
    this.speed = 0.05;
    this.isWalking = false;
    this.target = [];

    this.group.position.set(startPosition.x | 0, startPosition.y | 0, startPosition.z | 0)
    this.setPathFinding(mapGeometry);
    this.prepareCrossFade(this.runAction);
  }

  setPathFinding(map) {
    this.pathfinding = new Pathfinding();
    this.ZONE = 'level1';
    this.pathfinding.setZoneData(this.ZONE, Pathfinding.createZone(map));
  }

  moveTo(target) {
    const groupID = this.pathfinding.getGroup(this.ZONE, this.group.position);
    this.target = this.pathfinding.findPath(this.group.position, target, this.ZONE, groupID);
    this.setWalking(true);
    this.setOrientation();
  }

  move(decay) {
    this.group.add.x += Math.sin(this.character.rotation.y + decay) * this.speed;
    this.group.position.z += Math.cos(this.character.rotation.y + decay) * this.speed ;
    this.setWalking(true);
  }

  update(dt) {
    this.mixer.update( 0.01 );
    if (!this.target.length) return;
    const velocity = this.target[0].clone().sub( this.group.position );
    if (velocity.lengthSq() > 0.05 * 0.05) {
      velocity.normalize();
      this.group.position.add( velocity.multiplyScalar( dt * 15 ) );
    } else {
      this.target.shift();
      if(this.target.length) {
        this.setOrientation()
      }
      this.setWalking(!!this.target.length);
    }
  }

  setOrientation() {
    this.character.rotation.y = Math.atan2(this.target[0].x, this.target[0].z);
  }

  setWalking(walk) {
    if (this.isWalking === walk) return;
    console.log('crossfade', this.runAction);
    // this.prepareCrossFade(this.runAction);
    this.prepareCrossFade(walk ? this.runAction : this.idleAction);
    this.isWalking = walk;
  }

  /**
   * Add player pseudo
   */
  addPseudo() {
    const mesh = this.player.children.find(el => el.name === 'unamed');
    mesh.geometry.computeBoundingBox();
    mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());
    const size = {
      x: mesh.size.x,
      y: mesh.size.y,
      z: mesh.size.z,
    };
    const name = 'Jean-mi'
    const playerName = makeTextSprite( ` ${name} `, { fontsize: 20, fontface: "Arial" });
    playerName.position.set(size.x, size.y, size.z);
    this.group.add( playerName );
  }
}
