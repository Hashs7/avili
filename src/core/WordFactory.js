import * as THREE from "three";
import { Body, Box, Vec3 } from "cannon-es";

const margin = 15;

export default class WordFactory {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.loader = new THREE.FontLoader();
    this.words = [];
    this.offset = this.words.length * margin * 0.5;

    this.loader.load('./assets/fonts/Anton/Anton-Regular.json', f => this.setup(f));
  }

  setup(f) {
    // These options give us a more candy-ish render on the font
    this.fontOption = {
      font: f,
      size: 3,
      height: 0.4,
      curveSegments: 24,
      bevelEnabled: true,
      bevelThickness: 0.9,
      bevelSize: 0.3,
      bevelOffset: 0,
      bevelSegments: 10
    };
    const ground = new Body({
      mass: 0,
      shape: new Box(new Vec3(50, 0.1, 50)),
      position: new Vec3(0, this.words.length * margin - this.offset, 0)
    });

    ground.addEventListener('collide', (e) => {
      console.log('collide ', e);
    })

    this.world.addBody(ground);

    this.addWord('Cuisine');
  }

  addWord(text) {
    const totalMass = 10;
    const words = new THREE.Group();
    words.letterOff = 0;
    this.offset = this.words.length * margin * 0.5;


    // ... and parse each letter to generate a mesh
    Array.from(text).forEach((letter) => {
      const material = new THREE.MeshPhongMaterial({ color: 0x97df5e });
      const geometry = new THREE.TextBufferGeometry(letter, this.fontOption);

      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();

      const mesh = new THREE.Mesh(geometry, material);
      mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());
      // We'll use this accumulator to get the offset of each letter. Notice that this is not perfect because each character of each font has specific kerning.
      words.letterOff += mesh.size.x;

      // Create the shape of our letter
      // Note that we need to scale down our geometry because of Box's Cannon.js class setup
      // Attach the body directly to the mesh
      mesh.body = new Body({
        // We divide the totalmass by the length of the string to have a common weight for each words.
        mass: totalMass / text.length,
        position: new Vec3(words.letterOff, 20, 0),
      });

      // Add the shape to the body and offset it to match the center of our mesh
      const { center } = mesh.geometry.boundingSphere;
      const box = new Box(new Vec3().copy(mesh.size).scale(0.5));
      mesh.body.addShape(box, new Vec3(center.x, center.y, center.z));
      this.world.addBody(mesh.body);
      words.add(mesh);
    });

    words.children.forEach(letter => {
      letter.body.position.x -= letter.size.x + words.letterOff * 0.5;
    });

    this.words.push(words);
    this.scene.add(words);
  }

  update() {
    if (!this.words.length) return;

    this.words.forEach((word) => {
      for (let i = 0; i < word.children.length; i++) {
        const letter = word.children[i];

        letter.position.copy(letter.body.position);
        letter.quaternion.copy(letter.body.quaternion);
      }
    });
  }

  getOffsetY(i) {
    return (this.words.length - i + 1) * margin - this.offset;
  }
}