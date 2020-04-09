import * as THREE from "three";
import { Body, Box, ConeTwistConstraint, PointToPointConstraint, Sphere, Vec3 } from "cannon-es";

const margin = 15;
const force = 25;

export default class WordFactory {
  lastx;
  lasty;
  last;

  constructor(scene, world, camera) {
    this.scene = scene;
    this.world = world;
    this.clickMarker = false;
    this.loader = new THREE.FontLoader();
    this.words = [];
    this.offset = this.words.length * margin * 0.5;
    this.camera = camera;

    this.mouse = {
      x: 0,
      y: 0,
    }
    this.raycaster = new THREE.Raycaster();
    // Push with cursor
    // document.addEventListener("click", () => this.onClick());
    document.addEventListener("mousedown", (e) => this.onMouseDown(e));
    document.addEventListener("mouseup", () => this.onMouseUp());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e))
    this.loader.load('./assets/fonts/Anton/Anton-Regular.json', f => this.setup(f));
  }

  setConstraints() {
    this.words.forEach(word => {
      for (let i = 0; i < word.children.length; i++) {
        // We get the current letter and the next letter (if it's not the penultimate)
        const letter = word.children[i];
        const nextLetter = i === word.children.length - 1 ? null : word.children[i + 1];

        if (!nextLetter) continue;

        // I choosed ConeTwistConstraint because it's more rigid that other constraints and it goes well for my purpose
        const c = new ConeTwistConstraint(letter.body, nextLetter.body, {
          pivotA: new Vec3(letter.size.x, 0, 0),
          pivotB: new Vec3(0, 0, 0)
        });

        // Optionnal but it gives us a more realistic render in my opinion
        c.collideConnected = true;

        this.world.addConstraint(c);
      }
    });
  }

  onMouseMove(event) {
    // We set the normalized coordinate of the mouse
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (this.gplane && this.mouseConstraint) {
      const pos = this.projectOntoPlane(this.gplane, this.camera);
      if(pos){
        this.setClickMarker(pos.x,pos.y,pos.z, this.scene);
        this.moveJointToPoint(pos.x,pos.y,pos.z);
      }
    }
  }
  onClick() {
    // update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // calculate objects intersecting the picking ray
    // It will return an array with intersecting objects
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    if (intersects.length > 0) {
      const obj = intersects[0];
      const { object, face } = obj;

      if (!object.isMesh) return;

      const impulse = new THREE.Vector3()
        .copy(face.normal)
        .negate()
        .multiplyScalar(force);

      this.words.forEach((word) => {
        word.children.forEach(letter => {
          const { body } = letter;

          if (letter !== object) return;

          // We apply the vector 'impulse' on the base of our body
          body.applyLocalImpulse(impulse, new Vec3());
        });
      });
    }
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

    /*ground.addEventListener('collide', (e) => {
     console.log('collide ', e);
     })*/

    const shape = new Sphere(0.1);
    this.jointBody = new Body({ mass: 0 });
    this.jointBody.addShape(shape);
    this.jointBody.collisionFilterGroup = 0;
    this.jointBody.collisionFilterMask = 0;
    this.world.addBody(this.jointBody);

    this.world.addBody(ground);

    this.addWord('Cuisine');
  }

  addWord(text) {
    const totalMass = 1;
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
    this.setConstraints()

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

  setClickMarker(x,y,z) {
    if(!this.clickMarker){
      const shape = new THREE.SphereGeometry(0.2, 8, 8);
      const markerMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
      this.clickMarker = new THREE.Mesh(shape, markerMaterial);
      this.scene.add(this.clickMarker);
    }
    this.clickMarker.visible = true;
    this.clickMarker.position.set(x,y,z);
  }

  removeClickMarker(){
    if (!this.clickMarker) return;
    this.clickMarker.visible = false;
  }


  onMouseDown(){
    // Find mesh from a ray
    const objs = this.words.map(group => group.children);
    const entity = this.findNearestIntersectingObject(this.camera, objs.flat());
    const pos = entity.point;
    if(pos && entity.object.geometry instanceof THREE.TextBufferGeometry){
      this.constraintDown = true;
      // Set marker on contact point
      this.setClickMarker(pos.x,pos.y,pos.z, this.scene);

      // Set the movement plane
      this.setScreenPerpCenter(pos, this.camera);
      this.addMouseConstraint(pos.x,pos.y,pos.z, entity.object.body);
    }
  }

  onMouseUp(e) {
    this.constraintDown = false;
    // remove the marker
    this.removeClickMarker();

    // Send the remove mouse joint to server
    this.removeJointConstraint();
  }

  // This function creates a virtual movement plane for the mouseJoint to move in
  setScreenPerpCenter(point, camera) {
    // If it does not exist, create a new one
    if(!this.gplane) {
      const planeGeo = new THREE.PlaneGeometry(100,100);
      const material = new THREE.MeshLambertMaterial( { color: 0xffffff, transparent: true, opacity: 0 } );
      this.gplane = new THREE.Mesh(planeGeo, material);
      // this.gplane.visible = false;
      this.scene.add(this.gplane);
      console.log(this.gplane);
    }

    // Center at mouse position
    this.gplane.position.copy(point);

    // Make it face toward the camera
    this.gplane.quaternion.copy(camera.quaternion);
  }

  projectOntoPlane(thePlane, camera) {
    const now = new Date().getTime();
    // project mouse to that plane
    const hit = this.findNearestIntersectingObject(camera,[thePlane]);
    this.lastx = this.mouse.x;
    this.lasty = this.mouse.y;
    this.last = now;
    // console.log(hit);
    if(hit)
      return hit.point;
    return false;
  }

  findNearestIntersectingObject(camera, groups) {

    // Find the closest intersecting object
    // Now, cast the ray all render objects in the scene to see if they collide. Take the closest one.
    this.raycaster.setFromCamera( this.mouse, this.camera );
    const hits = this.raycaster.intersectObjects(groups);
    let closest = false;
    if (hits.length > 0) {
      closest = hits[0];
    }

    return closest;
  }

  addMouseConstraint(x,y,z,body) {
    // The cannon body constrained by the mouse joint
    this.constrainedBody = body;

    // Vector to the clicked point, relative to the body
    const v1 = new Vec3(x,y,z).vsub(this.constrainedBody.position);

    // Apply anti-quaternion to vector to tranform it into the local body coordinate system
    const antiRot = this.constrainedBody.quaternion.inverse();
    this.pivot = antiRot.vmult(v1); // pivot is not in local body coordinates

    // Move the cannon click marker particle to the click position
    this.jointBody.position.set(x,y,z);

    // Create a new constraint
    // The pivot for the jointBody is zero
    this.mouseConstraint = new PointToPointConstraint(this.constrainedBody, this.pivot, this.jointBody, new Vec3(0,0,0));

    // Add the constriant to world
    this.world.addConstraint(this.mouseConstraint);
  }

  // This functions moves the transparent joint body to a new postion in space
  moveJointToPoint(x,y,z) {
    // Move the joint body to a new position
    this.jointBody.position.set(x,y,z);
    this.mouseConstraint.update();
  }

  removeJointConstraint(){
    // Remove constriant from world
    this.world.removeConstraint(this.mouseConstraint);
    this.mouseConstraint = false;
  }


  getOffsetY(i) {
    return (this.words.length - i + 1) * margin - this.offset;
  }
}