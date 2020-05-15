import * as THREE from 'three'

export const ACTIONS = {
  IDLE: 'idle',
  RUNNING: 'running',
};

export default class {
  constructor(gltf, world, sceneManager, name) {
    this.world = world;
    this.sceneManager = sceneManager;
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 0);
    this.action = ACTIONS.IDLE;
    this.character = gltf.scene.children.find(el => el.name === name);
    this.character.position.set(0, 1, 0);
    this.group.add(this.character);
    this.mixer = new THREE.AnimationMixer(this.character);
    this.setAnimations(gltf.animations);
    sceneManager.mainSceneAddObject(this.group);
  }

  changeAppareance(gltf, name) {
    const newCharacter = gltf.scene.children.find(el => el.name === name);
    // newCharacter.position.copy(this.character.position);
    if (!newCharacter) return;
    this.group.remove(this.character);
    this.character = newCharacter;
    this.mixer = new THREE.AnimationMixer(this.character);
    this.setAnimations(gltf.animations);
    this.group.add(this.character)
  }

  setAnimations(animations) {
    this.idleAction = this.mixer.clipAction( animations.find(act => act.name === ACTIONS.IDLE));
    this.runAction = this.mixer.clipAction( animations.find(act => act.name === ACTIONS.RUNNING));
    // this.rightAction = this.mixer.clipAction( animations.find(act => act.name === ACTIONS.RIGHT_STRAF));
    // this.leftAction = this.mixer.clipAction( animations.find(act => act.name === ACTIONS.LEFT_STRAF));
    this.actions = [this.idleAction, this.runAction];
    this.activateAllActions();
  }

  prepareCrossFade( endAction, duration = 0.1 ) {
    const startAction = this.actions.find(ac => ac._clip.name === this.action);
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
    this.action = endAction._clip.name;
  }

  setWeight( action, weight ) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight( weight );
  }

  activateAllActions() {
    this.actions.forEach((ac, i) => {
      this.setWeight( ac, i === 0 ? 1 : 0);
    });
    // this.setWeight( this.idleAction, 1 );
    // this.setWeight( this.runAction, 0 );
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

  update() {
    // this.mixer.update( 0.01 );
  }
}
