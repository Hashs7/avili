export class InputManager {
  inputReceiver;
  boundOnKeyDown;
  boundOnKeyUp;

  constructor() {
    this.boundOnKeyDown = (evt) => this.onKeyDown(evt);
    this.boundOnKeyUp = (evt) => this.onKeyUp(evt);
    document.addEventListener('keydown', this.boundOnKeyDown, false);
    document.addEventListener('keyup', this.boundOnKeyUp, false);
  }

  destroy() {
    document.removeEventListener('keydown', this.boundOnKeyDown);
    document.removeEventListener('keyup', this.boundOnKeyUp);
  }

  setInputReceiver(receiver) {
    this.inputReceiver = receiver;
  }

  onKeyDown(event) {
    if (!this.inputReceiver) return;
    // this.inputReceiver.handleKeyboardEvent(event, event.code, true);
    this.inputReceiver.handleKeyboardEvent(event, event.which, true);
  }

  onKeyUp(event) {
    if (!this.inputReceiver) return;
    this.inputReceiver.handleKeyboardEvent(event, event.which, false);
  }
}