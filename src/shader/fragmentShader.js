const fragmentShader = `varying vec2 vUv;
void main() {
    gl_FragColor = vec4( vec3( vUv, 0.5 ), 1.0 );
}`;

export default fragmentShader;
