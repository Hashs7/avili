import AudioManager from "./AudioManager";

class TestimonyManager {
  constructor() {
    this.receiver = null;
    this.tr = null;
  }

  setReceiver(receiver, tr) {
    this.receiver = receiver;
    this.tr = tr;
  }

  /**
   * Start audio and subtitles
   * @param audio
   * @param sequence
   */
  speak(audio, sequence) {
    AudioManager.playSound(audio, true);
    if (!sequence) return;
    this.launchSequence(sequence);
  }

  /**
   * Launch each part of sequence
   * @param sequence
   * @param index
   */
  launchSequence(sequence, index = 0) {
    AudioManager.setAmbiantVolume(0.3);
    this.receiver.subtitle = this.tr(`${sequence}.${index}.sentence`);
    if (this.tr(`${sequence}.${index}.last`) === 'false') {
      setTimeout(() => {
        this.launchSequence(sequence, index + 1)
      }, Number(this.tr(`${sequence}.${index}.time`)));
      return;
    }
    setTimeout(() => {
      this.receiver.subtitle = null;
      AudioManager.setAmbiantVolume(1)
    }, Number(this.tr(`${sequence}.${index}.time`)));
  }

  launchAudio() {}
}

export default new TestimonyManager();
