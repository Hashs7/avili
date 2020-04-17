import * as THREE from 'three'
import gsap from 'gsap';
import InputManager from "../core/InputManager";
import { Body, Box, Cylinder, Vec3 } from "cannon-es";
import { toRadian } from "../../utils";

const ACTIONS = {
  WALK: 'Walk',
  IDLE: 'Idle',
}

const quartDegree = toRadian(90);

export class Character {
  constructor(gltf, world, camera, sceneManager) {
    this.inputManager = new InputManager();
    this.inputManager.setInputReceiver(this);
    this.sceneManager = sceneManager;
    this.action = ACTIONS.IDLE;

    this.speed = 4;
    this.wakable = true;

    this.world = world;
    this.camera = camera;

    this.raycaster = new THREE.Raycaster();
    //console.log(gltf.scene.children[0]);

    this.character = gltf.scene.children[0];
    this.character.name = "Player";
    this.character.position.set(0, 0, 0);
    this.character.scale.set(1, 1, 1);

    this.group = new THREE.Group();
    this.group.add(this.character);
    this.group.position.set(0,0,0);

    //console.log(gltf.scene);
    this.mixer = new THREE.AnimationMixer(this.character);
    this.mouse = {
      x: 0,
      y: 0,
    };

    window.addEventListener( 'mousemove', (e) => this.mouseMoveHandler(e), false );
    window.addEventListener( 'click', (e) => this.mouseClickHandler(e), false );

    this.setAnimations(gltf.animations);
    this.activateAllActions();
    this.addBody();
    console.log(this.character);

    sceneManager.mainSceneAddObject(this.group);
  }

  addBody() {
    console.log(this.character);
    const mesh = this.character.children.find(el => el.name === 'vanguard_Mesh');
    mesh.geometry.computeBoundingBox();
    mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());
    const center = mesh.geometry.boundingBox.getCenter(new THREE.Vector3());
    console.log(center, mesh.size, 'size');
    console.log(center, mesh.size, 'size');

    const box = new Box(new Vec3().copy(mesh.size).scale(0.5));
    console.log(box);

    const cylinderShape = new Cylinder(mesh.size.y/2, mesh.size.y/2,  mesh.size.x/2, 8);

    this.character.body = new Body({
      mass: 10,
      shape: cylinderShape,
      position: new Vec3().copy(this.character.position),
      // collisionFilterGroup: GROUP3, // Put the cylinder in group 3
      // collisionFilterMask:  GROUP1 // It can only collide with group 1 (the sphere)
    });


    this.world.addBody(this.character.body);

    const geometry = new THREE.CylinderGeometry( mesh.size.y, mesh.size.y, mesh.size.x, 8 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
    const hitbox = new THREE.Mesh( geometry, material );
    hitbox.position.set(0, (mesh.size.x/2), 0);
    this.group.add(hitbox);
  }

  destroy() {
    this.inputManager.setInputReceiver(null);
  }

  groupCamera() {
    this.camera.position.set(130, 350, 250);
    this.group.add(this.camera);
    this.updateLookAt();
  }

  mouseMoveHandler(event) {
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    const obj = this.raycaster.intersectObjects( this.sceneManager.mainScene.children );
    if (obj.length) {
      obj.forEach(el => {
        if (el.object.name !== "Floor") return;
        this.character.rotation.z = Math.atan2(el.point.x - this.group.position.x, el.point.z - this.group.position.z) + Math.PI
      });
    }
  }

  mouseClickHandler() {
    //console.log(this.character);
  }

  handleKeyboardEvent(event, code, pressed, moving) {
    if (!this.wakable) return;
    this.isWalking = moving;
    if (!moving && this.action !== ACTIONS.IDLE) {
      this.action = ACTIONS.IDLE;
      this.prepareCrossFade(this.walkAction, this.idleAction);
      return;
    }
    if (moving && this.action !== ACTIONS.WALK) {
      this.action = ACTIONS.WALK;
      this.prepareCrossFade(this.idleAction, this.walkAction);
      return;
    }

    this.updateLookAt();
  }


  playerControls() {
    if (this.inputManager.controls.up) {
      this.move(quartDegree * 2)
    }
    if (this.inputManager.controls.down) {
      this.move(0)
    }
    if (this.inputManager.controls.left) {
      this.move(-quartDegree)
    }
    if (this.inputManager.controls.right) {
      this.move(quartDegree)
    }
  }

  move(decay) {
    this.group.position.x += Math.sin(this.character.rotation.z + decay) * this.speed;
    this.group.position.z += Math.cos(this.character.rotation.z + decay) * this.speed;
    this.setWalking();
  }

  updateLookAt() {
    this.camera.lookAt(this.group.position.x - 135, this.group.position.y - 65,  this.group.position.z - 150);
  }

  update() {
    this.raycaster.setFromCamera( this.mouse, this.camera );
    this.playerControls();
    this.mixer.update( 0.01 );
  }

  setWalking() {
    const playerMovedEvent = new CustomEvent('playerMoved', {
      detail: this.character,
    });
    document.dispatchEvent(playerMovedEvent);
  }

  setWalkable(value) {
    this.wakable = value;
  }

  setAnimations(animations) {
    this.idleAction = this.mixer.clipAction( animations.find(act => act.name === 'Idle') );
    this.walkAction = this.mixer.clipAction( animations.find(act => act.name === 'Walk') );
    this.actions = [this.idleAction, this.walkAction];
  }

  prepareCrossFade( startAction, endAction, duration = 0.3 ) {
    // Switch default / custom crossfade duration (according to the user's choice)
    // const duration = this.setCrossFadeDuration( defaultDuration );
    this.unPauseAllActions();
    this.executeCrossFade( startAction, endAction, duration );

    // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
    // else wait until the current action has finished its current loop// debugger;

    /*    if ( startAction === this.idleAction ) {
     this.executeCrossFade( startAction, endAction, duration );
     } else {
     console.log('synch');
     this.synchronizeCrossFade( startAction, endAction, duration );
     }*/
  }


  synchronizeCrossFade( startAction, endAction, duration ) {
    const onLoopFinished = ( event ) => {
      if ( event.action === startAction ) {
        this.mixer.removeEventListener( 'loop', onLoopFinished );
        this.executeCrossFade( startAction, endAction, duration );
      }
    };
    this.mixer.addEventListener( 'loop', onLoopFinished );
  }

  executeCrossFade( startAction, endAction, duration ) {
    // Not only the start action, but also the end action must get a weight of 1 before fading
    // (concerning the start action this is already guaranteed in this place)
    this.setWeight( endAction, 1 );
    endAction.time = 0;

    // Crossfade with warping - you can also try without warping by setting the third parameter to false
    startAction.crossFadeTo( endAction, duration, true );
  }

  setWeight( action, weight ) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight( weight );
  }

  activateAllActions() {
    this.setWeight( this.idleAction, 1);
    this.setWeight( this.walkAction, 0 );
    this.actions.forEach(( action ) => action.play());
  }

  pauseContinue() {
    if ( this.idleAction.paused ) {
      this.unPauseAllActions();
      return
    }
    this.pauseAllActions();
  }

  pauseAllActions() {
    this.actions.forEach(( action ) => action.paused = true);
  }

  unPauseAllActions() {
    this.actions.forEach(( action ) => action.paused = false);
  }
}
