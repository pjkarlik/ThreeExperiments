const vertexShader = `
${window.THREE.ShaderChunk.shadowmap_pars_vertex}

varying vec2 vUv;
void main()
{
  vUv = -uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  ${window.THREE.ShaderChunk.begin_vertex}
  ${window.THREE.ShaderChunk.worldpos_vertex}
  ${window.THREE.ShaderChunk.shadowmap_vertex}
}
`;
export default vertexShader;
