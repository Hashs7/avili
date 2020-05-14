import AudioManager from "./AudioManager";

const definitionNPC = [{
  name: 'leo',
  pseudo: 'Daesu',
},{
  name: 'loris',
  pseudo: 'Farkana',
},{
  name: 'nico',
  pseudo: 'Schteppe',
}];

const projAudio = [{
  name: 'nico',
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
}];

const fovAudio = [{
  name: 'leo',
  sound: 'perso.mp3',
  time: 3100,
}, {
  name: 'leo',
  sound: 'perdregame.mp3',
  time: 1500,
}]

const wordsAudio = [{
  name: 'leo',
  sound: 'inutile.mp3',
  time: 3100,
}, {
  name: 'loris',
  sound: 'cuisine.mp3',
  time: 1500,
}, {
  name: 'leo',
  sound: 'moche.mp3',
  time: 1500,
}, {
  name: 'leo',
  sound: 'pute.mp3',
  time: 1000,
}, {
  name: 'leo',
  sound: 'salope.mp3',
  time: 1500,
}]

export default class NPCAudio {
  contrustor(world) {
    this.world = world;
    this.projectileHit = 0;
    this.fovDetected = 0;
    this.wordDropped = 0;
  }

  initEventListeners() {
    document.addEventListener('npcAudio', (e) => {
      switch (e.detail) {
        case 'spawn'  : this.spawnSequence();
          break;
        case 'projectile':
          this.projectileSequence();
          break;
        case 'fov':
          this.insultsSequence();
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
   * @param name : loris / nico / leo
   * @param sound : .mp3
   * @param time : number in ms
   */
  play(name, sound, time) {
    const { pseudo } = definitionNPC.find(el => el.name === name);
    AudioManager.playSound(`${name}/${sound}`, true);
    this.world.store.commit('setCommunication', { name: pseudo, time })
  }

  /**
   * Salut les gars
   */
  spawnSequence() {
    definitionNPC.forEach((npc, i) => {
      setTimeout(() => {
        this.play(npc.name, 'salutlesgars.mp3', 2000);
      }, i * 1500)
    })
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

  insultsSequence() {
    this.play('leo', 'perso.mp3', 3100);
  }

  wordsSequence() {
    const { name, sound, time } = fovAudio[this.wordDropped];
    this.play(name, sound, time);
    this.wordDropped !== 5 ?
      this.wordDropped += 1 : this.wordDropped = 0;
  }
}