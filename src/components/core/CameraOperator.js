import * as THREE from "three";
import { SceneUtils } from "three/examples/jsm/utils/SceneUtils";
import { toRadian } from "../../utils";
import gsap from "gsap";

class CameraOperator{
  constructor() {
    this.travelling = false;
    this.targetRotation = 0;

    this.binormal = new THREE.Vector3();
    this.normal = new THREE.Vector3();

    this.tube = null;
    this.mesh = null;
    this.tubeMesh = null;
    this.lookAhead = true;
    this.scale = 1;
    this.offset = 0;

    this.world = null;
    this.camera = null;
    this.parent = null;
  }

  setup(world, camera) {
    this.world = world;
    this.camera = camera;
    this.parent = world.sceneManager.mainScene;
  }

  /**
   * Set render camera travelling
   * @param isTravelling
   */
  setTravelling(isTravelling) {
    this.travelling = isTravelling;
    this.start = Date.now();
  }

  /**
   *
   * @param spline
   * @param segNum
   * @param closeBool
   * @param radSeg
   * @param mesh
   * @param scaleVar
   * @param geoSide
   * @param color
   */
  addTube(spline, segNum, closeBool, radSeg, mesh, scaleVar, geoSide, color) {
    const segments = segNum || 100;
    const radiusSegments = radSeg || 3;
    this.mesh = this.mesh || null;

    if (this.tubeMesh) this.parent.remove(this.tubeMesh);

    this.tube = new THREE.TubeGeometry(spline, segments, 0.1, radiusSegments, false);
    color = color || 0x2194ce;
    geoSide = geoSide || THREE.FrontSide;

    this.addGeometry(mesh, this.tube, color, geoSide);

    this.scale = scaleVar || 1;
    this.tubeMesh.scale.set( this.scale, this.scale, this.scale );
  }

  addGeometry(mesh, geometry, color, geoSide) {
    // 3d shape
    if(this.mesh === null) {
      this.tubeMesh = SceneUtils.createMultiMaterialObject( geometry, [
        new THREE.MeshLambertMaterial({
          color: color,
          side: geoSide,
          opacity: 0,
          transparent: true,
        })]);
    } else {
      this.tubeMesh = mesh;
    }
    this.tubeMesh.visibility = false;

    this.parent.add( this.tubeMesh );
  }

  addSpline(mesh, geometry) {
    this.tube = geometry;
    this.parent.add( mesh );
  }

  setCallback(cl) {
    this.callback = cl
  }

  launchCallback() {
    this.callback()
  }

  /**
   * Animate the camera along the spline
   */
  renderFollowCamera() {
    if (!this.travelling) return;
    const time = Date.now() - this.start;
    const looptime = 20 * 1000;
    const t = ( time % looptime ) / looptime;
    const pos = this.tube.parameters.path.getPointAt( t );

    pos.multiplyScalar( this.scale );

    // interpolation
    const segments = this.tube.tangents.length;
    const pickt = t * segments;
    const pick = Math.floor( pickt );
    const pickNext = ( pick + 1 ) % segments;

    this.binormal.subVectors( this.tube.binormals[ pickNext ], this.tube.binormals[ pick ] );
    this.binormal.multiplyScalar( pickt - pick ).add( this.tube.binormals[ pick ] );

    const dir = this.tube.parameters.path.getTangentAt( t );

    this.normal.copy( this.binormal ).cross( dir );

    // We move on a offset on its binormal
    pos.add( this.normal.clone().multiplyScalar( this.offset ) );
    this.camera.position.copy( pos );


    // Using arclength for stablization in look ahead.
    const lookAt = this.tube.parameters.path.getPointAt( ( t + 30 / this.tube.parameters.path.getLength() ) % 1 ).multiplyScalar( this.scale );

    // Camera Orientation 2 - up orientation via normal
    // if (!this.lookAhead) {
    lookAt.copy( pos ).add( dir );
    // }
    // this.camera.matrix.lookAt(this.camera.position, lookAt - 15, this.normal);
    this.camera.rotation.setFromRotationMatrix( this.camera.matrix.makeRotationAxis(new THREE.Vector3(0, 1, 0), Math.PI/2), this.camera.rotation.order );
    this.camera.rotateY(toRadian(180));
    this.camera.rotateX(toRadian(-15));

    if (Number(t.toFixed(3)) > 0.995) {
      this.travelling = false;
      this.parent.remove(this.tubeMesh);
      this.launchCallback()
    }
  }

  zoom(callback){
    const tl = gsap.timeline({repeat: 0});
    tl.to(this.camera, {
      zoom: 2.5,
      duration: 2,
      onUpdate: () => {this.camera.updateProjectionMatrix()},
      onComplete: () => {callback()},
    });
    tl.to(this.camera, {
      zoom: 1,
      duration: 1.5,
      delay: 1,
      onUpdate: () => {this.camera.updateProjectionMatrix()},
    })
  }
}

export default new CameraOperator();
