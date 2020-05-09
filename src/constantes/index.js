export const QUALITY_SETTING = [{
  name: 'Basse',
  recommended: false,
},{
  name: 'Moyenne',
  recommended: false,
},{
  name: 'Élevé',
  recommended: true,
}]

export const GAME_STATES = {
  configuration: 'configuration',
  launched: 'launched',
  cinematic: 'cinematic',
  main_player_spawn: 'main_player_spawn',
  npc_spawn_start: 'npc_spawn_start',
  all_npc_spawned: 'all_npc_spawned',
  mc_controllable: 'mc_controllable',
  projectile_sequence_start: 'projectile_sequence_start',
  projectile_sequence_pending: 'projectile_sequence_pending',
  projectile_sequence_end: 'projectile_sequence_end',
  infiltration_sequence_start: 'infiltration_sequence_start',
  infiltration_sequence_pending: 'infiltration_sequence_pending',
  infiltration_sequence_end: 'infiltration_sequence_end',
  words_sequence_start: 'words_sequence_start',
  words_sequence_pending: 'words_sequence_pending',
  words_sequence_end: 'words_sequence_end',
  final_black_screen: 'final_black_screen',
  final_respawn: 'final_respawn',
  final_teleportation: 'final_teleportation',
}