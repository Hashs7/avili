export let CircleOutlineShader = {
  vertexShader:`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  fragmentShader:`
  precision mediump float;
  varying vec2 vUv;
  uniform float uCircleSize;

  void main() {
    vec2 center = vec2(0.5);
    float distanceFromCenter = length(vUv - center);
    if(distanceFromCenter > 0.48) {
      gl_FragColor = vec4(1., 0., 0., 0.5);
    } else {
      if(distanceFromCenter < uCircleSize){
        gl_FragColor = vec4(0., 0., 0., 0.3);
      }
    }
  }
  `,
}
