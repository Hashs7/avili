import * as THREE from "three/src/Three";
import LoadManager from './LoadManager'

class AudioManager {
  constructor() {
    this.listener = null;
    this.introAudio = null;
    this.audios = [];
  }

  initAudio() {
    this.listener = new THREE.AudioListener();
  }

  loadAudio() {
    if (!this.listener) return;
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
      'music/laser.mp3',
      'music/npc-angoissant.mp3',
    ];
    audioPaths.forEach(file => {
      LoadManager.loadAudio(prefix + file, (buffer) => {
        const audio = new THREE.Audio( this.listener ).setBuffer( buffer );
        audio.name = file;
        this.audios.push(audio);
      })
    })
  }

  setIntroLoopAudio() {
    this.introAudio = new Audio('./assets/audio/music/ambient-calm.mp3');
    this.bindIntro = () => {
      this.currentTime = 0;
      this.introAudio.play();
    };
    this.introAudio.addEventListener('ended', this.bindIntro, false);
    this.introAudio.play();
  }

  stopIntroLoopAudio() {
    this.introAudio.stop();
    this.introAudio.removeListener('ended', this.bindIntro);
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
