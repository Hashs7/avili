import AudioManager from "./AudioManager";
import * as THREE from "three";
import LoadManager from "./LoadManager";

const definitionNPC = [{
  name: 'leo',
  pseudo: 'Daesu',
},{
  name: 'loris',
  pseudo: 'Farkana',
},{
  name: 'florian',
  pseudo: 'Schteppe',
},{
  name: 'jordan',
  pseudo: 'Tardys',
}];

const spawnAudio = [{
  name: 'florian',
  sound: 'salutlesgars.mp3',
  time: 3000,
}, {
  name: 'leo',
  sound: 'salutlesgars.mp3',
  time: 1500,
}, {
  name: 'loris',
  sound: 'salutlesgars.mp3',
  time: 3000,
}, {
  name: 'jordan',
  sound: 'salutlesgars.mp3',
  time: 3000,
}];

const otherAudio = [{
  name: 'loris',
  sound: 'gros.mp3',
  time: 1500,
}];

const projAudio = [{
  name: 'florian',
  sound: 'tourdemerde.mp3',
  time: 3000,
}, {
  name: 'leo',
  sound: 'perdregame.mp3',
  time: 1500,
}, {
  name: 'leo',
  sound: 'jouemeuf.mp3',
  time: 3000,
}, {
  name: 'leo',
  sound: 'rage.mp3',
  time: 3000,
}];

const fovAudio = [{
  name: 'leo',
  sound: 'perso.mp3',
  time: 3100,
}, {
  name: 'jordan',
  sound: 'ahmaistunefilleenfait.mp3',
  time: 2000,
}];

const wordsAudio = [{
  name: 'leo',
  sound: 'inutile.mp3',
  time: 3100,
}, {
  name: 'loris',
  sound: 'cuisine.mp3',
  time: 1500,
}, {
  name: 'jordan',
  sound: 'moche.mp3',
  time: 1500,
}, {
  name: 'jordan',
  sound: 'salepute.mp3',
  time: 3000,
}, {
  name: 'leo',
  sound: 'salope.mp3',
  time: 1500,
}];

export default class NPCAudio {
  constructor(world) {
    this.world = world;
    this.projectileHit = 0;
    this.fovDetected = 0;
    this.wordDropped = 0;
    this.listener = new THREE.AudioListener();
    this.audios = [];
    this.initEventListeners();
  }

  loadAudio() {
    const prefixTestimony ='./assets/audio/npc';
    const audioPaths = [...spawnAudio, ...otherAudio, ...projAudio, ...fovAudio, ...wordsAudio].flat();
    audioPaths.forEach(({ name, sound }) => {
      LoadManager.loadAudio(`${prefixTestimony}/${name}/${sound}`, (buffer) => {
        const audio = new THREE.Audio( this.listener ).setBuffer( buffer );
        audio.name = `${name}-${sound}`;
        this.audios.push(audio);
      })
    });
  }

  initEventListeners() {
    document.addEventListener('npcAudio', (e) => {
      switch (e.detail.sequence) {
        case 'spawn': this.spawnSequence(e.detail.pseudo);
          break;
        case 'start': this.startSequence();
          break;
        case 'projectile': this.projectileSequence();
          break;
        case 'fov':
          this.insultsSequence(e.detail.pseudo);
          break;
        case 'word':
          this.wordsSequence();
          break;
        default: break;
      }
    })
  }

  /**
   *
   * @param name : loris / florian / leo
   * @param sound : .mp3
   * @param time : number in ms
   */
  play(name, sound, time) {
    const { pseudo } = definitionNPC.find(el => el.name === name);
    AudioManager.playSound(`${name}/${sound}`, true);
    this.world.store.commit('setCommunication', { name: pseudo, time });

    const audio = this.audios.find(au => au.name === `${name}-${sound}`);
    if (!audio) return;
    audio.play();
  }

  /**
   * Salut les gars
   */
  spawnSequence(pseudo) {
    const player = definitionNPC.find(el => el.pseudo === pseudo);
    if (!player) return;
    this.play(player.name, 'salutlesgars.mp3', 2000);
  }

  /**
   * Gros tu fous quoi ?
   */
  startSequence() {
    this.play('loris', 'gros.mp3', 2000);
  }

  projectileSequence() {
    const { name, sound, time } = projAudio[this.projectileHit];
    this.play(name, sound, time);
    this.projectileHit !== 2 ?
      this.projectileHit += 1 : this.projectileHit = 0;
  }

  characterSequence() {
    const { name, sound, time } = fovAudio[this.fovDetected];
    this.play(name, sound, time);
    this.fovDetected !== 1 ?
      this.fovDetected += 1 : this.fovDetected = 0;
  }

  /**
   *
   * @param pseudo
   */
  insultsSequence(pseudo) {
    // TODO en fonction du pseudo du fov

    const { name, sound, time } = fovAudio[this.fovDetected];
    this.play(name, sound, time);
    this.fovDetected !== 2 ?
      this.fovDetected += 1 : this.fovDetected = 0;
  }

  wordsSequence() {
    const { name, sound, time } = wordsAudio[this.wordDropped];
    this.play(name, sound, time);
    this.wordDropped !== 5 ?
      this.wordDropped += 1 : this.wordDropped = 0;
  }
}