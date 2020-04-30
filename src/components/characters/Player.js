import * as THREE from 'three'
import InputManager from "../core/InputManager";
import { Body, Box,  Vec3 } from "cannon-es";
import { makeTextSprite, toRadian, drawRay } from "../../utils";
import AudioManager from "../core/AudioManager";
import Character, { ACTIONS } from "./Character";

const quartDegree = toRadian(90);

export default class extends Character {
  constructor(gltf, world, camera, sceneManager, name) {
    super(gltf, world, sceneManager, name);
    this.camera = camera;
    // this.speed = 0.1;
    this.speed = 0.05;
    this.wakable = true;
    this.inputManager = new InputManager();
    this.inputManager.setInputReceiver(this);
    this.nextPosition;

    this.raycaster = new THREE.Raycaster();

    AudioManager.groupListener(this.group);

    this.mouse = {
      x: 0,
      y: 0,
    };

    window.addEventListener( 'mousemove', (e) => this.mouseMoveHandler(e), false );

    this.sceneManager = sceneManager;
    this.addBody(sceneManager);
    sceneManager.mainSceneAddObject(this.camera);
  }

  addBody(sceneManager) {
    const mesh = this.character.children.find(el => el.name === 'unamed');
    // const mesh = this.character;
    mesh.geometry.computeBoundingBox();
    mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());
    // const center = mesh.geometry.boundingBox.getCenter(new THREE.Vector3());
    const size = {
      x: mesh.size.x,
      y: mesh.size.y,
      z: mesh.size.z,
    };

    // const cylinderShape = new Cylinder(mesh.size.y/2, mesh.size.y/2,  mesh.size.x/2, 8);
    /*const boxShape = new Box(new Vec3(size.x/2, size.y/2, size.x/2));

    this.character.body = new Body({
      mass: 5,
      shape: boxShape,
      position: new Vec3(this.character.position.x, 2, this.character.position.z),
      // position: new Vec3().copy(this.character.position),
      collisionFilterGroup: 1,
      // collisionFilterMask:  GROUP1 // It can only collide with group 1 (the sphere)
    });
    this.character.body.addEventListener("collide", (e) => {
      // console.log("The character just collided with ", e.name);
      // console.log("Collided with body:",e.body);
      // console.log("Contact between bodies:",e.contact);
    });

    this.world.addBody(this.character.body);*/
z
    const geometry = new THREE.CylinderGeometry( size.x, size.x, size.y, 8 );
    // const geometry = new THREE.BoxGeometry( mesh.size.y, mesh.size.z, mesh.size.y, 4);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, visible: false });
    this.hitbox = new THREE.Mesh( geometry, material );
    this.hitbox.position.set(0, size.y / 2, 0);
    this.hitbox.name = 'hitbox';

    this.group.add(this.hitbox);
    // sceneManager.mainSceneAddObject(this.hitbox);
  }

  destroy() {
    this.inputManager.setInputReceiver(null);
  }

  groupCamera() {
    // this.character.position.set(0, 1, 0);
    const spotLight = new THREE.SpotLight( 0xAD9DFB, 1, 0, 0.314, 1);
    spotLight.position.set(-12, 15, 5);
    spotLight.lookAt(this.character.position);
    // this.group.add(spotLight);
    // const spotLightHelper = new THREE.SpotLightHelper( spotLight );
    // this.group.add( spotLightHelper );
    this.camera.position.set(-9, 6.5, 5.8);
    this.camera.lookAt(this.character.position);
    this.group.add(this.camera);
  }

  mouseMoveHandler(event) {
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    const obj = this.raycaster.intersectObjects( this.sceneManager.mainScene.children );
    if (!obj.length) return;
    obj.forEach(el => {
      if (el.object.name !== 'Floor') return;
      const position = {
        x: el.point.x - this.group.position.x,
        z: el.point.z - this.group.position.z
      };
      if (Math.sqrt(position.x * position.x + position.z * position.z) < 0.1) return;
      this.character.rotation.y = Math.atan2(position.x, position.z);
    });
  }

  /**
   * Define action to trigger on keyboard event
   * @param moving
   * @returns {*[]}
   */
  crossActions(moving) {
    return [{
      name: 'UP',
      condition: moving && this.action !== ACTIONS.RUNNING && this.inputManager.controls.up,
      action: this.runAction,
    },{
      name: 'DOWN',
      condition: moving && this.action !== ACTIONS.RUNNING && this.inputManager.controls.down,
      action: this.runAction,
    },{
      name: 'LEFT',
      condition: moving && this.action !== ACTIONS.LEFT_STRAF && this.inputManager.controls.left,
      action: this.leftAction,
    },{
      condition: moving && this.action !== ACTIONS.RIGHT_STRAF && this.inputManager.controls.right,
      name: 'RIGHT',
      action: this.rightAction,
    }]
  }

  handleKeyboardEvent(event, code, pressed, moving) {
    if (!this.wakable) return;
    this.isWalking = moving;
    if (!moving && this.action !== ACTIONS.IDLE) {
      this.prepareCrossFade(this.idleAction);
      return;
    }

    this.crossActions(moving).forEach((ac) => {
      if (!ac.condition) return;
      this.prepareCrossFade(ac.action);
    });
  }

  detectWallCollision(nextPosition){
    const hitbox = this.character.parent.children[2];
    const walls = this.sceneManager.walls;
    let isCollide = false;

    //hitbox.position.x += nextPosition.x;
    //hitbox.position.z += nextPosition.z;

    const originPoint = new THREE.Vector3().setFromMatrixPosition(hitbox.matrixWorld);
    originPoint.x += nextPosition.x
    originPoint.z += nextPosition.z

    for (let vertexIndex = 0; vertexIndex < hitbox.geometry.vertices.length; vertexIndex++)
    {
      const localVertex = hitbox.geometry.vertices[vertexIndex].clone();
      const globalVertex = localVertex.applyMatrix4( hitbox.matrix );
      const directionVector = globalVertex.sub( hitbox.position );

      const ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize());

      const collisionResults = ray.intersectObjects( [walls] );
      if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() )
        isCollide = true;
    }
    return isCollide;
  }

  detectWallCollisionOld () {
    const character = new THREE.Vector3().setFromMatrixPosition(this.character.matrixWorld);
    const walls = this.sceneManager.walls;

    const directions = [
      { vector: new THREE.Vector3(0, 0, 1), label: "forward" },
      { vector: new THREE.Vector3(0.5, 0, 0.5), label: "for-left" },
      { vector: new THREE.Vector3(0.5, 0, -0.5), label: "for-right" },
      { vector: new THREE.Vector3(0, 0, -1), label: "backward" },
      { vector: new THREE.Vector3(0.5, 0, -0.5), label: "back-left" },
      { vector: new THREE.Vector3(-0.5, 0, -0.5), label: "back-right" },
      { vector: new THREE.Vector3(1, 0, 0), label: "left" },
      { vector: new THREE.Vector3(-1, 0, 0), label: "right" },
    ];

    let collisionWall = '';

    directions.forEach(dir => {
      const ray = new THREE.Raycaster(character, dir.vector.applyQuaternion( this.character.quaternion ),0, 0.5);
      const objs = ray.intersectObject(walls, false);
      collisionWall = objs.length > 0 ? dir.label : collisionWall;
    });

    return collisionWall;
  }


  playerControls() {
    const strafe = this.inputManager.controls.left && this.inputManager.controls.up ||
                  this.inputManager.controls.right && this.inputManager.controls.up ||
                  this.inputManager.controls.left && this.inputManager.controls.down ||
                  this.inputManager.controls.right && this.inputManager.controls.down;
    if (this.inputManager.controls.up) {
      this.move(0, strafe)
    }
    if (this.inputManager.controls.down) {
      this.move(quartDegree * 2, strafe)
    }
    if (this.inputManager.controls.left) {
      this.move(quartDegree, strafe)
    }
    if (this.inputManager.controls.right) {
      this.move(-quartDegree, strafe)
    }
  }

  move(decay, isStrafing) {
    const speed = isStrafing ? this.speed / 2 : this.speed;
    // this.character.body.position.x += Math.sin(this.character.rotation.y + decay) * this.speed;
    // this.character.body.position.z += Math.cos(this.character.rotation.y + decay) * this.speed;

    // get nextPosition
    this.nextPosition = {
      x: Math.sin(this.character.rotation.y + decay) * speed,
      z: Math.cos(this.character.rotation.y + decay) * speed};
    if(this.detectWallCollision(this.nextPosition)) return;

    this.group.position.x += Math.sin(this.character.rotation.y + decay) * speed;
    this.group.position.z += Math.cos(this.character.rotation.y + decay) * speed;
    this.setWalking();
  }

  update() {
    // this.character.position.copy(this.character.body.position);
    // this.hitbox.position.copy(this.character.body.position);
    this.mixer.update( 0.01 );
    this.raycaster.setFromCamera( this.mouse, this.camera );
    this.playerControls();
  }

  setWalking() {
    const playerMovedEvent = new CustomEvent('playerMoved', {
      detail: this.character,
    });
    document.dispatchEvent(playerMovedEvent);
    if (this.isWalking) return;
    this.prepareCrossFade(this.runAction);
    this.isWalking = true;
  }

  setWalkable(value) {
    this.wakable = value;
  }
}
