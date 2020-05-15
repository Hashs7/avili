import * as THREE from 'three'
import { makeTextSprite, randomInRange } from "../../utils";
import Character from "./Character";
import { Pathfinding } from "three-pathfinding";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";
import gsap from 'gsap';

export default class extends Character {
  constructor(gltf, world, sceneManager, name, startPosition, mapGeometry, pseudo) {
    super(gltf, world, sceneManager, name);
    this.speed = 1;
    this.isWalking = false;
    this.target = [];
    this.group.name = 'NPC';
    this.group.pseudo = pseudo;
    this.plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 12);
    this.group.position.copy(startPosition);
    this.skinnedMesh = this.character.children[0].children.filter(child => child instanceof THREE.SkinnedMesh);
    console.log('char', this.character.position)
    this.setPathFinding(mapGeometry);
    this.addPseudo(pseudo);
    // this.createPlaneStencilGroup();
    // this.prepareCrossFade(this.runAction);
  }

  hide() {
    this.skinnedMesh.forEach(mesh => {
      mesh.material.transparent = true;
      mesh.material.opacity = 0;
    });
  }

  showAnimation(index) {
    const delay = (randomInRange(400, 1000) / 1000) + (index / 2);
    this.skinnedMesh.forEach(mesh => {
      mesh.material.transparent = true;
      mesh.material.opacity = 0;
      gsap.to(mesh.material, {
        opacity: 1,
        delay,
        duration: 1,
        onComplete: () => {
          mesh.material.transparent = false;
        },
      })
    });
    gsap.to(this.playerName.material, {
      opacity: 1,
      duration: .3,
      delay: delay,
      onComplete: () => {
        document.dispatchEvent(new CustomEvent('npcAudio', { detail: {
          sequence: 'spawn',
          pseudo: this.pseudo,
        }}));
      }
    })
  }

  /**
   * init pathfinding
   * @param map
   */
  setPathFinding(map) {
    this.pathfinding = new Pathfinding();
    this.ZONE = 'level1';
    this.pathfinding.setZoneData(this.ZONE, Pathfinding.createZone(map));
    //debugger

  }

  /**
   * Move npc to Vector3
   * @param target
   */
  moveTo(target) {
    const groupID = this.pathfinding.getGroup(this.ZONE, this.group.position);
    //this.target = this.pathfinding.findPath(this.group.position, target, this.ZONE, groupID);
    this.target = [new THREE.Vector3(10.8, 0, 0.5), new THREE.Vector3(34.54, 0, 0.27)];
    if (!this.target) {
      console.error('Path not found');
      return
    }
    this.setWalking(true);
    this.setOrientation(this.target[0]);
  }

  teleportTo(target, sendEvent) {
    this.group.position.copy(target);
    if (!sendEvent) return;
    document.dispatchEvent(new CustomEvent('showFov'));
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

      if (this.target.length) {
        this.setOrientation(this.target[0]);
        return;
      }

      // Finished walking
      this.setWalking(false);
      if (!this.walkCallback) return;
      this.walkCallback()
    }
  }

  setWalkCallback(cb) {
    this.walkCallback = cb;
  }

  /**
   * Turn npc orientation with Vector3
   * @param x
   * @param z
   */
  setOrientation({ x, z }) {
    this.group.rotation.y = Math.atan2(x - this.group.position.x, z - this.group.position.z);
  }

  /**
   *
   * @param walk
   */
  setWalking(walk) {
    if (this.isWalking === walk) return;
    this.prepareCrossFade(walk ? this.runAction : this.idleAction);
    this.isWalking = walk;
  }

  async addPseudo(name) {
    this.pseudo = name;
    this.playerName = await makeTextSprite(name, { fontsize: 26, fontface: "Roboto Slab" });
    this.playerName.position.set(0, 1.7, 0);
    this.group.add(this.playerName);

    // Hide pseudo on start
    this.playerName.material.transparent = true;
    this.playerName.material.opacity = 0;
  }

  createPlaneStencilGroup(renderOrder = 1) {
    const skinnedMesh = this.character.children[0].children.filter(child => child instanceof THREE.SkinnedMesh);
    const geometries = skinnedMesh.map(skin => skin.geometry);
    const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);

    const group = new THREE.Group();
    const baseMat = new THREE.MeshBasicMaterial();
    baseMat.depthWrite = false;
    baseMat.depthTest = false;
    baseMat.colorWrite = false;
    baseMat.stencilWrite = true;
    baseMat.stencilFunc = THREE.AlwaysStencilFunc;

    // back faces
    const mat0 = baseMat.clone();
    mat0.side = THREE.BackSide;
    mat0.clippingPlanes = [this.plane];
    mat0.stencilFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZPass = THREE.IncrementWrapStencilOp;

    const mesh0 = new THREE.Mesh(geometry, mat0);
    mesh0.renderOrder = renderOrder;
    group.add(mesh0);

    // front faces
    const mat1 = baseMat.clone();
    mat1.side = THREE.FrontSide;
    mat1.clippingPlanes = [this.plane];
    mat1.stencilFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZPass = THREE.DecrementWrapStencilOp;

    const mesh1 = new THREE.Mesh(geometry, mat1);
    mesh1.renderOrder = renderOrder;

    group.add(mesh1);
    this.group.add(group);

    const planeGeom = new THREE.PlaneBufferGeometry(100, 100);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0xE91E63,
      metalness: 0.1,
      roughness: 0.75,
      clippingPlanes: this.plane,
      stencilWrite: true,
      stencilRef: 0,
      stencilFunc: THREE.NotEqualStencilFunc,
      stencilFail: THREE.ReplaceStencilOp,
      stencilZFail: THREE.ReplaceStencilOp,
      stencilZPass: THREE.ReplaceStencilOp,
    });

    const po = new THREE.Mesh(planeGeom, planeMat);
    po.onAfterRender = (renderer) => renderer.clearStencil();
    po.renderOrder = renderOrder;
    this.group.add(po);
  }
}
