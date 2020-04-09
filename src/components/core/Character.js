import * as THREE from 'three/src/Three'
import gsap from 'gsap';
import { InputManager } from "./InputManager";

export class Character {
  camera;
  mixer;
  actions;
  isWalking;
  idleAction;
  walkAction;
  group;
  character;
  speed = 9;
  wakable = true;

  constructor(gltf, camera, scene) {
    this.inputManager = new InputManager();
    this.inputManager.setInputReceiver(this);
    this.scene = scene;

    gltf.scene.scale.set(0.2, 0.2, 0.2);
    gltf.scene.position.set(0, 0, 0);
    this.character = gltf.scene.children[0];
    this.camera = camera;
    this.camera.position.set(-130, 350, -250);
    this.raycaster = new THREE.Raycaster();
    this.group = new THREE.Group();
    this.group.add(this.character);
    this.group.add(this.camera);
    this.group.position.set(0,0,0);
    this.character.position.set(0,10,0);
    this.character.scale.set(1,1,1);
    this.mixer = new THREE.AnimationMixer(this.character);
    this.mouse = {
      x: 0,
      y: 0,
    };

    window.addEventListener( 'mousemove', (e) => this.mouseMoveHandler(e), false );
    window.addEventListener( 'click', (e) => this.mouseClickHandler(e), false );

    this.setAnimations(gltf.animations);
    this.activateAllActions();
    this.updateLookAt();
  }

  destroy() {
    this.inputManager.setInputReceiver(null);
  }

  mouseMoveHandler(event) {
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    const obj = this.raycaster.intersectObjects( this.scene.children );
    if (obj.length) {
      obj.forEach(el => {
        if (el.object.name !== "Floor") return;
        this.character.rotation.z = Math.atan2(el.point.x - this.group.position.x, el.point.z - this.group.position.z) + Math.PI
      });
    }
  }

  mouseClickHandler() {
    console.log(this.character);
  }

  handleKeyboardEvent(event, code, pressed) {
    if (!this.wakable) return;
    if (!pressed) {
      this.isWalking = false;
      this.prepareCrossFade(this.walkAction, this.idleAction);
      return
    }
    const direction = {
      x: Math.sin(this.character.rotation.z) * this.speed,
      z: Math.cos(this.character.rotation.z) * this.speed,
    }
    switch (code) {
      case 38:
        // Up key
        /*gsap.to(this.character.rotation, {
         z: toRadian(180),
         duration: .3,
         });*/
        gsap.to(this.group.position, {
          x: `-=${direction.x}`,
          z: `-=${direction.z}`,
          duration: .1,
        });
        this.setWalking();
        break;

      case 40:
        // down key
        gsap.to(this.group.position, {
          x: `+=${direction.x}`,
          z: `+=${direction.z}`,
          duration: .1,
        });
        // this.group.position.z -= 10;
        this.setWalking();
        break;

      case 37:
        // Left key
        gsap.to(this.group.position, {
          x: `-=${direction.x}`,
          z: `+=${direction.z}`,
          duration: .1,
        });
        // this.group.position.x +=10;
        this.setWalking();
        break;

      case 39:
        // Right key
        gsap.to(this.group.position, {
          x: `+=${direction.x}`,
          z: `-=${direction.z}`,
          duration: .1,
        });
        // this.group.position.x -= 10;
        this.setWalking();
        break;
      default:
        break;
    }
    this.updateLookAt();
  }

  updateLookAt() {
    this.camera.lookAt(this.group.position.x + 135, this.group.position.y - 65,  this.group.position.z + 150);
  }

  update() {
    this.raycaster.setFromCamera( this.mouse, this.camera );
    this.mixer.update( 0.01 );
  }

  setWalking() {
    if (this.isWalking) return;
    this.prepareCrossFade(this.idleAction, this.walkAction);
    this.isWalking = true;
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