export default class {
  constructor() {
    this.inputReceiver = null;
    this.boundOnKeyDown = (e) => this.onKeyDown(e);
    this.boundOnKeyUp = (e) => this.onKeyUp(e);
    document.addEventListener('keydown', this.boundOnKeyDown, false);
    document.addEventListener('keyup', this.boundOnKeyUp, false);
    this.controls = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
    this.mouse = {
      position: {
        x: 0,
        y: 0,
      },
      leftPress: false,
      rightPress: false,
    };
  }

  destroy() {
    document.removeEventListener('keydown', this.boundOnKeyDown);
    document.removeEventListener('keyup', this.boundOnKeyUp);
  }

  setInputReceiver(receiver) {
    this.inputReceiver = receiver;
  }

  setControls(code, value) {
    switch (code) {
      case 38: // up
      case 90: // z
        this.controls.up = value;
        break;

      case 37: // left
      case 81: // q
        this.controls.left = value;
        break;

      case 40: // down
      case 83: // s
        this.controls.down = value;
        break;

      case 39: // right
      case 68: // d
        this.controls.right = value;
        break;
    }
  }

  onKeyDown(event) {
    this.setControls(event.which, true);
    const moving = this.controls.up || this.controls.down || this.controls.left || this.controls.right;
    if (!this.inputReceiver) return;
    this.inputReceiver.handleKeyboardEvent(event, event.which, true, moving);
  }

  onKeyUp(event) {
    this.setControls(event.which, false);

    if (!this.inputReceiver) return;
    this.inputReceiver.handleKeyboardEvent(event, event.which, false, false);
  }
}