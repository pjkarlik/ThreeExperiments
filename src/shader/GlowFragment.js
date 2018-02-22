/* eslint-disable */
THREE.RenderFragment = {
  uniforms: {

    "tDiffuse":   { value: null },
    "tSize":      { value: new THREE.Vector2( 1024, 1024 ) },
    "time":       { value: 0.0 },

  },

  vertexShader: [

    "varying vec2 vUv;",
    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"

  ].join( "\n" ),

  fragmentShader: [

    "uniform vec2 center;",
    "uniform float time;",
    "varying vec2 vUv;",
    
    "void main() {",
      "vec2 uv = vUv;",
      "float utime = time * 0.1;",
      "uv *= 2.0;",
      "uv -= 1.0;",
      "vec3 finalColor = vec3 ( .2, 1., 0. );",
      "finalColor *= abs(10.05 / (sin( uv.x + sin(uv.y+utime)* 0.3 ) * 20.0) );",
      "gl_FragColor = vec4( finalColor, 1.0 );",
    "}"

  ].join( "\n" )

};
