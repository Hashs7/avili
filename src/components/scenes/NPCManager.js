import * as THREE from "three";
import LoadManager from "../core/LoadManager";
import NPC from "../characters/NPC";
import { randomInRange } from "../../utils";
import NPCAudio from "../core/NPCAudio";

const npcOrder = [
  'Daesu',
  'Tardys',
  'Farkana',
  'Schteppe',
];

const npcsDefinition = (positions) => [{
  name: 'Daesu',
  position: new THREE.Vector3(-1, 0, 2),
  toTeleport: new THREE.Vector3(0, 0, 0),
  target: new THREE.Vector3(positions[0].x, 0, positions[0].z),
},{
  name: 'Tardys',
  position: new THREE.Vector3(2, 0, -2),
  toTeleport: new THREE.Vector3(0, 0, 0),
  target: new THREE.Vector3(positions[1].x, 0, positions[1].z),
},{
  name: 'Farkana',
  position: new THREE.Vector3(5, 0, -3),
  toTeleport: new THREE.Vector3(0, 0, 0),
  target: new THREE.Vector3(positions[2].x, 0, positions[2].z),
},{
  name: 'Schteppe',
  position: new THREE.Vector3(3, 0, 3),
  toTeleport: new THREE.Vector3(0, 0, 0),
  target: new THREE.Vector3(positions[3].x, 0, positions[3].z),
}];

export default class NPCManager {
  constructor(world, sceneManager) {
    this.world = world;
    this.sceneManager = sceneManager;
    this.npcs = [];
    this.mapPositions = [];
    this.npcAudio = new NPCAudio(world);
    //this.target = [new THREE.Vector3(10.8, 0, 0.5), new THREE.Vector3(34.54, 0, 0.27)];
  }

  async loadNPC(map) {
    this.npcAudio.loadAudio();
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

  sortNPC() {
    return this.npcs.sort((a, b) => npcOrder.indexOf(a.pseudo) - npcOrder.indexOf(b.pseudo));
  }

  moveNPC() {
    this.target = [new THREE.Vector3(11, 0, 0.5), new THREE.Vector3(34, 0, 0)];
    console.log(this.sortNPC());
    this.sortNPC().forEach((n, i) => {
        const delay = (i * randomInRange(200, 500)) + 3000;
        setTimeout(() => {
          n.moveTo(this.target);
          n.setWalkCallback(() => {
            console.log('teleport inside callback', n);
            const isLast = i === this.sortNPC().length - 1;
            n.teleportTo(npcsDefinition(this.mapPositions)[i].target, isLast);
          });
        }, delay)
    });
    // no delay version
    // this.npcs.forEach((n, i) => n.moveTo(npcsDefinition(this.mapPositions)[i].target));
  }

  teleportNPC() {
    this.npcs.forEach((n, i) => n.teleportTo(npcsDefinition(this.mapPositions)[i].target));
  }

  /**
   * Positions set by designers from map
   */
  addMatesPos({ position }) {
    this.mapPositions.push(position);
  }

  update(timeStep) {
    for (let i = 0; i < this.npcs.length; i++) {
      this.npcs[i].update(timeStep);
    }
  }
}
