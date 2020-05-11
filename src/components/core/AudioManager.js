import * as THREE from "three/src/Three";
import LoadManager from './LoadManager'

class AudioManager {
  constructor() {
    this.listener = new THREE.AudioListener();
    this.audios = [];
  }

  loadAudio() {
    const prefix ='./assets/audio/';
    const audioPaths = [
      'black_screen.mp3',
      'ending.mp3',
      'first_badword.mp3',
      'infiltration_end.mp3',
      'infiltration_introduction.mp3',
      'second_badword.mp3',
      'spawn_mates.mp3',
      'spawn_player.mp3',
      'travelling.mp3',
      'audio_mot_cuisine.mp3',
    ];
    audioPaths.forEach(file => {
      LoadManager.loadAudio(prefix + file, (buffer) => {
        const audio = new THREE.Audio( this.listener ).setBuffer( buffer );
        audio.name = file;
        this.audios.push(audio);
      })
    })
  }

  groupListener(group) {
    group.add(this.listener);
  }

  playSound(name) {
    const audio = this.audios.find(file => file.name === name);
    if (!audio) return;
    audio.play();
  }

}

export default new AudioManager();
