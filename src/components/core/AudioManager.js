import * as THREE from "three/src/Three";
import LoadManager from './LoadManager'
import gsap from 'gsap';

class AudioManager {
  constructor() {
    this.testimonyListener = null;
    this.ambiantListener = null;
    this.ambiantVolume = 1;
    this.audios = [];

    this.introAudio = new Audio('./assets/audio/music/ambient-calm.mp3');
    this.windAudio = new Audio('./assets/audio/music/ambiance-vent.mp3');
    this.endAudio = new Audio('./assets/audio/music/fin.mp3');
  }

  initAudio() {
    this.testimonyListener = new THREE.AudioListener();
    this.ambiantListener = new THREE.AudioListener();
  }

  loadAudio() {
    if (!this.testimonyListener) return;
    const prefixTestimony ='./assets/audio/testimony/';
    const audioTestimony = [
      'black_screen.mp3',
      'ending.mp3',
      'first_badword.mp3',
      'infiltration_end.mp3',
      'infiltration_introduction.mp3',
      'second_badword.mp3',
      'spawn_mates.mp3',
      'spawn_player.mp3',
    ];
    audioTestimony.forEach(file => {
      LoadManager.loadAudio(prefixTestimony + file, (buffer) => {
        const audio = new THREE.Audio( this.testimonyListener ).setBuffer( buffer );
        audio.name = file;
        this.audios.push(audio);
      })
    });

    if (!this.ambiantListener) return;
    const prefixAmbiant ='./assets/audio/ambiant/';
    const audioAmbiant = [
      'ko.mp3',
      'audio_mot_cuisine.mp3',
      'laser.mp3',
      'explosion.mp3',
      'npc-angoissant.mp3',
    ];
    audioAmbiant.forEach(file => {
      LoadManager.loadAudio(prefixAmbiant + file, (buffer) => {
        const audio = new THREE.Audio( this.ambiantListener ).setBuffer( buffer );
        audio.name = file;
        this.audios.push(audio);
      })
    });
  }

  setIntroLoopAudio() {
    this.bindIntro = () => this.introAudio.play();
    this.introAudio.addEventListener('ended', this.bindIntro, false);
    this.introAudio.play();
  }

  stopIntroLoopAudio() {
    if (!this.introAudio) return;
    gsap.to(this.introAudio, {
      volume: 0,
      duration: 1,
      onComplete: () => {
        this.introAudio.pause();
        this.introAudio.currentTime = 0;
        this.introAudio.removeEventListener('ended', this.bindEnd);
      }
    });
  }

  setWindLoopAudio() {
    this.bindWind = () => this.windAudio.play();
    this.windAudio.addEventListener('ended', this.bindWind, false);
    this.windAudio.play();
  }

  stopWindLoopAudio() {
    if (!this.windAudio) return;
    gsap.to(this.windAudio, {
      volume: 0,
      duration: 1,
      onComplete: () => {
        this.windAudio.pause();
        this.windAudio.currentTime = 0;
        this.windAudio.removeEventListener('ended', this.bindEnd);
      }
    })
  }

  setEndLoopAudio() {
    this.bindEnd = () => this.endAudio.play();
    this.endAudio.addEventListener('ended', this.bindEnd, false);
    this.endAudio.play();
  }

  stopEndLoopAudio() {
    if (!this.endAudio) return;
    gsap.to(this.endAudio, {
      volume: 0,
      duration: 1,
      onComplete: () => {
        this.endAudio.pause();
        this.endAudio.currentTime = 0;
        this.endAudio.removeEventListener('ended', this.bindEnd);
      }
    })
  }

  groupListener(group) {
    group.add(this.testimonyListener);
    group.add(this.ambiantListener);
  }

  setAmbiantVolume(value) {
    gsap.to(this, {
      ambiantVolume: value,
      onUpdate: () => this.ambiantListener.setMasterVolume(this.ambiantVolume),
      duration: 1,
    });
    gsap.to(this.introAudio, {
      volume: value,
      duration: 1,
    });
    gsap.to(this.windAudio, {
      volume: value,
      duration: 1,
    })
  }

  playSound(name, isTestimony) {
    const audio = this.audios.find(file => file.name === name);
    if (!audio) return;
    audio.play();
  }
}

export default new AudioManager();
