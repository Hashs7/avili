import * as THREE from "three";
import LoadManager from "../core/LoadManager";
import NPC from "../characters/NPC";

const npcsDefinition = (positions) => [{
  name: 'Daesu',
  position: new THREE.Vector3(-1, 0, 2),
  toTeleport: new THREE.Vector3(32, 0, 0),
  target: new THREE.Vector3(positions[0].x, 0, positions[0].z),
},{
  name: 'Tardys',
  position: new THREE.Vector3(2, 0, -2),
  toTeleport: new THREE.Vector3(32, 0, 0),
  target: new THREE.Vector3(positions[1].x, 0, positions[1].z),
},{
  name: 'Farkana',
  position: new THREE.Vector3(5, 0, -3),
  toTeleport: new THREE.Vector3(32, 0, 0),
  target: new THREE.Vector3(positions[2].x, 0, positions[2].z),
},{
  name: 'Schteppe',
  position: new THREE.Vector3(3, 0, 3),
  toTeleport: new THREE.Vector3(32, 0, 0),
  target: new THREE.Vector3(positions[3].x, 0, positions[3].z),
}];

export default class NPCManager {
  constructor(world, sceneManager) {
    this.world = world;
    this.sceneManager = sceneManager;
    this.npcs = [];
    this.mapPositions = [];
  }

  async loadNPC(map) {
    return await Promise.all(npcsDefinition(this.mapPositions).map(async (n) => {
      const gltf = await LoadManager.loadGLTF('./assets/models/characters/npc.glb');
      const npc = new NPC(gltf, this.world, this.sceneManager, 'npc', n.position, map.geometry, n.name);
      this.npcs.push(npc);
    }));
  }

  hideNPC() {
    this.npcs.forEach((n) => n.hide());
  }

  showNPC() {
    this.npcs.forEach((n, i) => n.showAnimation(i));
  }

  moveNPC() {
    this.npcs.forEach((n, i) =>
      // delay each npc start moving
      setTimeout(() => {
          n.moveTo(npcsDefinition(this.mapPositions)[i].toTeleport);
          n.setWalkCallback(() => {
            document.dispatchEvent(new CustomEvent('showFov'));
            n.teleportTo(npcsDefinition(this.mapPositions)[i].target)
          })
      }, (i * 500) + 3000)
    );
    // no delay version
    // this.npcs.forEach((n, i) => n.moveTo(npcsDefinition(this.mapPositions)[i].target));
  }

  teleportNPC() {
    this.npcs.forEach((n, i) => n.teleportTo(npcsDefinition(this.mapPositions)[i].target));
  }

  /**
   * Positions set by designers from map
   */
  addMatesPos(position) {
    this.mapPositions.push(position);
  }

  update(timeStep) {
    for (let i = 0; i < this.npcs.length; i++) {
      this.npcs[i].update(timeStep);
    }
  }
}
