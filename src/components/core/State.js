import { GAME_STATES } from "../../constantes";

export default class {
  constructor(index = 0){
    this.states = Object.keys(GAME_STATES).map(key => GAME_STATES[key]);
    this.index = index;
    this.currentState = this.states[this.index];
  }

  nextState(){
    this.index += 1;
    this.currentState = this.states[this.index];
    const event = new CustomEvent('stateUpdate', {detail : this.currentState});
    document.dispatchEvent(event);
  }

  goToState(name) {
    this.currentState = name;
    console.log('newstate ', name);
    const event = new CustomEvent('stateUpdate', {detail : this.currentState});
    document.dispatchEvent(event);
  }
}
