export default class {
  constructor(index = 0){
    this.states = [
      "configuration", "launched", "cinematic", "main_player_spawn",
      "npc_spawn_start", "npc_1_spawn", "npc_2_spawn", "npc_3_spawn",
      "npc_4_spawn", "all_npc_spawned", "mc_controllable",
      "projectile_sequence_start", "projectile_sequence_pending", "projectile_sequence_end",
      "infiltration_sequence_start", "infiltration_sequence_pending", "infiltration_sequence_end",
      "words_sequence_start", "words_sequence_pending", "words_sequence_end",
      "finished"
    ]
    this.index = index;
    this.currentState = this.states[this.index];
  }

  nextState(){
    this.index += 1;
    this.currentState = this.states[this.index];

    const event = new CustomEvent('stateUpdate', {detail : this.currentState});
    document.dispatchEvent(event);
  }

  goToState(name){
    this.currentState = name;

    const event = new CustomEvent('stateUpdate', {detail : this.currentState});
    document.dispatchEvent(event);
  }
}
