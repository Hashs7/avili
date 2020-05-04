export let GlowShader = {
  vertexShader:`
  varying vec3 vUv;
  uniform float c;
  uniform float p;
  uniform vec3 viewVector;
  varying float intensity;

  void main() {
    vUv = position;
    vec3 vNormal = normalize(normalMatrix * normal);
    vec3 vNormel = normalize(normalMatrix * viewVector);
    intensity = pow(c - dot(vNormal, vNormel), p) * 2.0;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  fragmentShader:`
  uniform float uSize;
  varying vec3 vUv;
  uniform vec3 glowColor;
  varying float intensity;

  void main() {
    vec3 glow = glowColor * intensity;
    if(vUv.y < uSize) {
      gl_FragColor = vec4(glow, 1.0);
    } else {
      gl_FragColor = vec4(glow, 0.0);
    }
  }
  `,
}
