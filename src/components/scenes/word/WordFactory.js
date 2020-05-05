import * as THREE from "three/src/Three";
import { Body, Box, PointToPointConstraint, Sphere, Vec3 } from "cannon-es/dist/index";
import LoadManager from "../../core/LoadManager";
import { toRadian } from "../../../utils";
import { Quaternion } from "cannon-es";

export default class WordFactory {
  constructor(scene, world, camera, manager, material) {
    this.lastx = null;
    this.lasty = null;
    this.last = null;
    this.scene = scene;
    this.world = world;
    this.camera = camera;
    this.manager = manager;
    this.material = material;
    this.clickMarker = false;
    this.words = [];
    // this.offset = this.words.length * margin * 0.5;

    this.mouse = {
      x: 0,
      y: 0,
    };
    this.raycaster = new THREE.Raycaster();
    // Push with cursor
    // document.addEventListener("click", () => this.onClick());
    document.addEventListener("mousedown", (e) => this.onMouseDown(e));
    document.addEventListener("mouseup", () => this.onMouseUp());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    LoadManager.loadFont('./assets/fonts/Anton/Anton-Regular.json', f => this.setup(f));
  }

  setup(f) {
    // These options give us a more candy-ish render on the font
    this.fontOption = {
      font: f,
      size: 18,
      height: 2,
      curveSegments: 24,
      bevelEnabled: true,
      bevelThickness: 0.9,
      bevelSize: 0.3,
      bevelOffset: 0,
      bevelSegments: 10
    };

    const shape = new Sphere(0.1);
    this.jointBody = new Body({ mass: 0 });
    this.jointBody.addShape(shape);
    this.jointBody.collisionFilterGroup = 0;
    this.jointBody.collisionFilterMask = 0;
    this.world.addBody(this.jointBody);


    // this.addWord('Cuisine', new Vec3(118, 3, -4));
  }


  setConstraints() {
    /*this.words.forEach(word => {
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
    });*/
  }

  /**
   *
   * @param event
   */
  onMouseMove(event) {
    // We set the normalized coordinate of the mouse
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (!this.gplane || !this.mouseConstraint) return;
    const pos = this.projectOntoPlane(this.gplane, this.camera);

    if(!pos) return;
    this.setClickMarker(pos.x, pos.y, pos.z, this.scene);
    this.moveJointToPoint(pos.x, pos.y, pos.z);
  }

  addWord({ text, position, mass, collide }) {
    const material = new THREE.MeshPhongMaterial({ color: 0x97df5e });
    const geometry = new THREE.TextBufferGeometry(text, this.fontOption);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    const mesh = new THREE.Mesh(geometry, material);
    const scaleFactor = 0.1;

    mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
    mesh.name = text;
    mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());

    if (collide) {
      const hitGeometry = new THREE.BoxGeometry( mesh.size.x, mesh.size.y, mesh.size.z );
      const hitbox = new THREE.Mesh(hitGeometry, new THREE.MeshBasicMaterial({ wireframe: true }));
      hitbox.name = 'hitbox-' + text;
      hitbox.position.add(new THREE.Vector3(mesh.size.x/2, mesh.size.y/2, mesh.size.z/2));
      mesh.add(hitbox);
      this.manager.addCollider(hitbox);
    }
    mesh.body = new Body({
      mass,
      position,
      material: this.material,
      quaternion: new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), toRadian(-90)),
      velocity: new Vec3(0, 0, 0),
      fixedRotation: true,
      // linearDamping: 0.01,
      // collisionFilterGroup: 1,
    });
    // mesh.body.force = new Vec3(0, -100, 0);

    // Add the shape to the body and offset it to match the center of our mesh
    const center = mesh.geometry.boundingBox.getCenter(new THREE.Vector3());
    const box = new Box(new Vec3().copy(mesh.size).scale(0.5 * scaleFactor));
    mesh.body.name = 'word';
    mesh.body.addShape(box);

    this.world.addBody(mesh.body);
    this.words.push(mesh);
    this.scene.add(mesh);
  }

  update() {
    if (!this.words.length) return;
    for (let i = 0; i < this.words.length; i++) {
      this.words[i].position.copy(this.words[i].body.position);
      this.words[i].quaternion.copy(this.words[i].body.quaternion);
    }
  }

  setClickMarker(x,y,z) {
    if(!this.clickMarker){
      const shape = new THREE.SphereGeometry(0.2, 8, 8);
      const markerMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
      this.clickMarker = new THREE.Mesh(shape, markerMaterial);
      this.clickMarker.name = 'ClickMarker'
      this.scene.add(this.clickMarker);
    }
    this.clickMarker.visible = true;
    this.clickMarker.position.set(x,y,z);
  }

  removeClickMarker(){
    if (!this.clickMarker) return;
    this.clickMarker.visible = false;
  }

  onMouseDown() {
    // Find mesh from a ray
    const entity = this.findNearestIntersectingObject(this.camera, this.words);
    const pos = entity.point;
    if (pos && entity.object.geometry instanceof THREE.TextBufferGeometry){
      this.constraintDown = true;
      // Set marker on contact point
      this.setClickMarker(pos.x,pos.y,pos.z, this.scene);

      // Set the movement plane
      this.setScreenPerpCenter(pos, this.camera);
      this.addMouseConstraint(pos.x,pos.y,pos.z, entity.object.body);
    }
  }

  onMouseUp() {
    this.constraintDown = false;
    // remove the marker
    this.removeClickMarker();
    // Send the remove mouse joint to server
    this.removeJointConstraint();
  }

  // This function creates a virtual movement plane for the mouseJoint to move in
  setScreenPerpCenter(point, camera) {
    if(!this.gplane) {
      const planeGeo = new THREE.PlaneGeometry(100,100);
      const material = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } );
      this.gplane = new THREE.Mesh(planeGeo, material);
      this.gplane.name = 'GPlane';
      this.scene.add(this.gplane);
    }

    // Center at mouse position
    this.gplane.position.copy(point);
    // Make it face toward the camera
    this.gplane.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), toRadian(-90)));
  }

  projectOntoPlane(thePlane, camera) {
    const now = new Date().getTime();
    // project mouse to that plane
    const hit = this.findNearestIntersectingObject(camera,[thePlane]);
    this.lastx = this.mouse.x;
    this.lasty = this.mouse.y;
    this.last = now;
    if (hit) return hit.point;
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
    // this.jointBody.position.set(x,y,z);
    this.jointBody.position.y = y;
    this.mouseConstraint.update();
  }

  removeJointConstraint(){
    // Remove constriant from world
    this.world.removeConstraint(this.mouseConstraint);
    this.mouseConstraint = false;
  }
}
