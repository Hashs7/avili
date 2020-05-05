export let GlowShader = {
  vertexShader:`
  varying vec3 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  fragmentShader:`
  uniform float uSize;
  varying vec3 vUv;
  varying vec3 vNormal;

  void main() {
    float intensity = pow( 0.7 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 2.0 );
    if(vUv.y < uSize) {
      gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 ) * intensity;
    } else {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
  }
  `,
}
