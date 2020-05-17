import * as THREE from "three/src/Three";
import { Body, Box, PointToPointConstraint, Sphere, Vec3 } from "cannon-es/dist/index";
import { toRadian } from "../../../utils";
import { Quaternion } from "cannon-es";
import Stats from 'stats.js'

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
    this.models = [];
    // this.offset = this.words.length * margin * 0.5;
    this.stats = new Stats();
    this.stats.showPanel(1);
    // document.body.appendChild( this.stats.dom );

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
    // LoadManager.loadFont('./assets/fonts/Anton/Anton-Regular.json', f => this.setup(f));
    // LoadManager.loadFont('./assets/fonts/Anton/Anton-Regular.json', f => this.setup(f));
    this.setup()
  }

  setup() {
    // These options give us a more candy-ish render on the font
    /*this.fontOption = {
      font: f,
      size: 18,
      height: 2,
      curveSegments: 24,
      bevelEnabled: true,
      bevelThickness: 0.9,
      bevelSize: 0.3,
      bevelOffset: 0,
      bevelSegments: 10
    };*/

    const shape = new Sphere(0.1);
    this.jointBody = new Body({ mass: 0 });
    this.jointBody.addShape(shape);
    this.jointBody.collisionFilterGroup = 0;
    this.jointBody.collisionFilterMask = 0;
    this.world.addBody(this.jointBody);
  }

  setMeshes(meshes) {
    this.models = meshes;
  }

  addWord({ text, position, mass, collide, movable }, index) {
    const mesh = this.models[index];
    mesh.movable = movable;
    const scaleFactor = 2;

    mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
    mesh.name = text;
    mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());

    const hitGeometry = new THREE.BoxGeometry( mesh.size.x, mesh.size.y, mesh.size.z );
    const hitbox = new THREE.Mesh(hitGeometry, new THREE.MeshBasicMaterial({ visible: false }));
    hitbox.name = 'hitbox-' + text;
    hitbox.position.add(new THREE.Vector3(0,mesh.size.y/2, 0));
    mesh.add(hitbox);
    if (collide) {
      this.manager.addCollider(hitbox);
    } else {
      mesh.material.transparent = true;
    }
    mesh.body = new Body({
      mass,
      position,
      material: this.material,
      // quaternion: new Quaternion().setFromAxisAngle(new Vec3(0, 1, 0), toRadian(-90)),
      velocity: new Vec3(0, 0, 0),
      fixedRotation: true,
      // collisionFilterGroup: 1,
    });
    // mesh.body.force = new Vec3(0, -100, 0);

    // Add the shape to the body and offset it to match the center of our mesh
    // const center = mesh.geometry.boundingBox.getCenter(new THREE.Vector3());
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
      this.words[i].geometry.attributes.position.needsUpdate = true;
    }
  }

  setClickMarker(x,y,z) {
    if(!this.clickMarker){
      const shape = new THREE.SphereGeometry(0.2, 8, 8);
      const markerMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000, visible: false } );
      this.clickMarker = new THREE.Mesh(shape, markerMaterial);
      this.clickMarker.name = 'ClickMarker';
      this.scene.add(this.clickMarker);
    }
    this.clickMarker.visible = true;
    this.clickMarker.position.set(x,y,z);
  }

  removeClickMarker(){
    if (!this.clickMarker) return;
    this.clickMarker.visible = false;
  }

  /**
   *
   * @param event
   */
  onMouseMove(event) {
    this.stats.begin();

    // We set the normalized coordinate of the mouse
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    /*
     TODO optimize mouse hover word detection
    const entity = this.findNearestIntersectingObject(this.camera, this.words);
    if (entity.object && entity.object.movable) {
      // console.log('hover text');
    }
    */

    if (!this.gplane || !this.mouseConstraint) return;
    const pos = this.projectOntoPlane(this.gplane, this.camera);

    if(!pos) return;
    this.setClickMarker(pos.x, pos.y, pos.z, this.scene);
    this.moveJointToPoint(pos.x, pos.y, pos.z);
    this.stats.end();
  }

  onMouseDown() {
    // Find mesh from a ray
    const entity = this.findNearestIntersectingObject(this.camera, this.words);
    const pos = entity.point;

    if (pos && entity.object && entity.object.movable) {
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
  setScreenPerpCenter(point) {
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
  moveJointToPoint(x, y) {
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
