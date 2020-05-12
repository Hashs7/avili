import * as THREE from 'three'
import InputManager from "../core/InputManager";
import AudioManager from "../core/AudioManager";
import Character, { ACTIONS } from "./Character";
import { makeTextSprite } from "../../utils";

export default class extends Character {
  constructor(gltf, world, camera, sceneManager, name) {
    super(gltf, world, sceneManager, name);
    this.camera = camera;
    // this.speed = 0.1;
    this.speed = 0.05;
    this.orientable = true;
    this.walkable = true;
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

    // Debug
    /*
    this.stats = new Stats();
    this.stats.showPanel(1);
    */
  }

  addBody() {
    /*const mesh = this.character.children.find(el => el.name === 'unamed');
    mesh.geometry.computeBoundingBox();
    mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());*/
    // const center = mesh.geometry.boundingBox.getCenter(new THREE.Vector3());
    const size = {
      x: 0.3,
      y: 1.64,
      z: 1.11
    };

    // const cylinderShape = new Cylinder(mesh.size.y/2, mesh.size.y/2,  mesh.size.x/2, 8);
    // const boxShape = new Box(new Vec3(size.x/2, size.y/2, size.x/2));

    const geometry = new THREE.CylinderGeometry( size.x, size.x, size.y, 3 );
    // const geometry = new THREE.BoxGeometry( mesh.size.y, mesh.size.z, mesh.size.y, 4);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, visible: false });
    this.hitbox = new THREE.Mesh( geometry, material );
    this.hitbox.position.set(0, size.y / 2, 0);
    this.hitbox.name = 'hitbox';
    this.group.add(this.hitbox);
  }

  destroy() {
    this.inputManager.setInputReceiver(null);
  }

  groupCamera() {
    this.group.position.set(65, 0, 0);
    this.spotLight = new THREE.SpotLight( 0xAD9DFB, 1, 0, Math.PI/10, 1);
    this.spotLight.position.copy(new THREE.Vector3(-12, 15, 5).add(this.group.position));
    this.spotLight.castShadow = true;
    this.spotLight.target = this.group;

    // this.spotLight.lookAt(this.character.position);
    this.sceneManager.mainScene.add(this.spotLight);
    this.camera.position.set(-9, 6.5, 5.8);
    this.camera.lookAt(this.character.position);
    this.group.add(this.camera);
  }

  async addPseudo() {
    const playerName = await makeTextSprite(this.sceneManager.world.pseudo, { fontsize: 26, fontface: "Roboto Slab" });
    playerName.position.set(0, 1.6, 0);
    playerName.name = "pseudo";
    this.group.add(playerName);
  }

  mouseMoveHandler(event) {
    if (!this.orientable) return;
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    const obj = this.raycaster.intersectObjects( this.sceneManager.mainScene.children );
    if (!obj.length) return;
    for (let i = 0; i < obj.length; i++) {
      if (obj[i].object.name !== 'Floor') continue;
      const position = {
        x: obj[i].point.x - this.group.position.x,
        z: obj[i].point.z - this.group.position.z
      };
      if (Math.sqrt(position.x * position.x + position.z * position.z) < 0.1) continue;
      this.character.rotation.y = Math.atan2(position.x, position.z);
    }
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
    },
    /*
    {
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
    }*/
    ];
  }

  handleKeyboardEvent(event, code, pressed, moving) {
    if (!this.walkable) return;
    if (!moving && this.action !== ACTIONS.IDLE && !this.inputManager.controls.up) {
      this.isWalking = moving;
      this.prepareCrossFade(this.idleAction);
    }

    /*this.crossActions(moving).forEach((ac) => {
      if (!ac.condition) return;
      this.prepareCrossFade(ac.action);
    });*/
  }

  detectWallCollision(nextPosition){
    const hitbox = this.character.parent.children[2];
    let isCollide = false;

    //hitbox.position.x += nextPosition.x;
    //hitbox.position.z += nextPosition.z;

    const originPoint = new THREE.Vector3().setFromMatrixPosition(hitbox.matrixWorld);
    originPoint.x += nextPosition.x;
    originPoint.z += nextPosition.z;

    for (let vertexIndex = 0; vertexIndex < hitbox.geometry.vertices.length; vertexIndex++) {
      const localVertex = hitbox.geometry.vertices[vertexIndex].clone();
      const globalVertex = localVertex.applyMatrix4( hitbox.matrix );
      const directionVector = globalVertex.sub( hitbox.position );

      if(directionVector.y < 0) {
        const ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize());
        const collisionResults = ray.intersectObjects( this.sceneManager.colliders );
        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
          isCollide = true;
          return true;
        }
      }
    }

    return isCollide;
  }

  playerControls() {
/*    const strafe = this.inputManager.controls.left && this.inputManager.controls.up ||
                  this.inputManager.controls.right && this.inputManager.controls.up ||
                  this.inputManager.controls.left && this.inputManager.controls.down ||
                  this.inputManager.controls.right && this.inputManager.controls.down;*/
    if (this.inputManager.controls.up) {
      this.move(0)
    }
    /*
    if (this.inputManager.controls.down) {
      this.move(quartDegree * 2, strafe)
    }
    if (this.inputManager.controls.left) {
      this.move(quartDegree, strafe)
    }
    if (this.inputManager.controls.right) {
      this.move(-quartDegree, strafe)
    }
    */
  }

  move(decay) {
    // const speed = isStrafing ? this.speed / 2 : this.speed;
    // this.character.body.position.x += Math.sin(this.character.rotation.y + decay) * this.speed;
    // this.character.body.position.z += Math.cos(this.character.rotation.y + decay) * this.speed;
    // console.log(this.group.position);
    // get nextPosition
    if(!this.walkable) return;
    this.nextPosition = {
      x: Math.sin(this.character.rotation.y + decay) * this.speed,
      z: Math.cos(this.character.rotation.y + decay) * this.speed
    };

    if (this.detectWallCollision(this.nextPosition)) {
      this.setWalking(false);
      return;
    }

    this.group.position.x += this.nextPosition.x;
    this.group.position.z += this.nextPosition.z;
    this.spotLight.position.x += this.nextPosition.x;
    this.spotLight.position.z += this.nextPosition.z;
    this.setWalking(true);
  }

  update(timeStep) {
    // this.character.position.copy(this.character.body.position);
    // this.hitbox.position.copy(this.character.body.position);
    this.mixer.update( timeStep );
    this.raycaster.setFromCamera( this.mouse, this.camera );
    this.playerControls();
  }

  teleport(position, callback = null) {
    this.group.position.copy(position);
    this.spotLight.position.copy(new THREE.Vector3(-12, 15, 5).add(position));
    if(!callback) return;
    callback();
  }

  setWalking(walk) {
    if (walk) {
      const playerMovedEvent = new CustomEvent('playerMoved', {
        detail: this.character,
      });
      document.dispatchEvent(playerMovedEvent);
    }

    if (this.isWalking === walk) return;
    this.isWalking = walk;
    this.prepareCrossFade(walk ? this.runAction : this.idleAction);
  }

  setWalkable(value) {
    this.isWalking = false;
    this.walkable = value;
    this.prepareCrossFade(this.idleAction);
  }

  setOrientable(value) {
    this.orientable = value;
  }
}
