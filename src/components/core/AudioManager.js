import * as THREE from "three/src/Three";
import LoadManager from './LoadManager'

class AudioManager {
  constructor() {
    const prefix ='./assets/audio/';
    const audioPaths = [
      'audio_ecran_noir.mp3',
      'audio_fin_infiltration.mp3',
      'audio_fin_mot.mp3',
      'audio_info_infiltration.mp3',
      'audio_intro_insulte.mp3',
      'audio_mot_cuisine.mp3',
      'audio_mot_nude.mp3',
      'audio_mot_pute.mp3',
      'audio_msg_infiltration_1.mp3',
      'audio_msg_infiltration_2.mp3',
      'audio_msg_infiltration_3.mp3',
      'audio_msg_infiltration_4.mp3',
      'audio_npc_bougezvous.mp3'
    ];
    this.listener = new THREE.AudioListener();
    this.audios = [];
    audioPaths.forEach(file => {
      LoadManager.loadAudio(prefix + file, (buffer) => {
        const audio = new THREE.Audio( this.listener ).setBuffer( buffer )
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
