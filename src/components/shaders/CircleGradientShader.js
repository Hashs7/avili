export let CircleGradientShader = {
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

  void main() {
    vec4 colorA = vec4(1., 1., 1., 1.);
    vec4 colorB = vec4(1., 1., 1., 0.);

    vec2 center = vec2(0.5);

    float distanceFromLight = length(vUv - center);

    gl_FragColor = mix(colorA, colorB, distanceFromLight*2.);
  }
  `,
}
