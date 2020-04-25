import * as THREE from 'three';

export let ProjectileShader = {
  vertexShader:`
  varying vec3 vUv;

  void main() {
    vUv = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
  `,
  fragmentShader:`
  uniform float uSize;
  varying vec3 vUv;

  void main() {
    if(vUv.y < uSize) {
      gl_FragColor = vec4(1., 0., 0., 1.);
    } else {
      gl_FragColor = vec4(0., 0., 0., 0.);
    }
  }
  `,
}
