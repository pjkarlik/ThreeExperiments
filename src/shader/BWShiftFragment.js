/* eslint-disable */
THREE.RenderFragment = {
  uniforms: {

    "tDiffuse": { value: null },
    "tSize":    { value: new THREE.Vector2( 512, 512 ) },
    "center":   { value: new THREE.Vector2( 0.5, 0.5 ) },
    "ratio":    { value: 1024.0 },
    "time":     { value: 0.0 },
    "scale":    { value: 2.0 }

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
    "uniform float scale;",
    "uniform float ratio;",
    "uniform float time;",
    "uniform float frenz;",
    "uniform vec2 tSize;",
    "uniform sampler2D tDiffuse;",
    "varying vec2 vUv;",

    "float pattern() {",
      "float df = time * 0.1;",
      "vec2 q = vUv;",
      "float s = sin(1.57 / 80.0), c = cos(1.57 / 80.0);",
      "vec2 tex = vUv * tSize - center;",
      "vec2 point = vec2( 0.5 * tex.x - 0.5 * tex.y + df, 0.5 * tex.x + 0.5 * tex.y + df ) * 0.5;",
      "return (sin( point.x / 10.0 ) * sin( point.y / 10.0) ) * 20.5;",

    "}",

    "void main() {",
      "vec2 q = vUv;",
      "float df = time * 0.1;",
      "float Pixels = ratio;",
      "float dx = scale * (1.20 / Pixels);",
      "float dy = scale * (1.20 / Pixels);",
      "vec2 Coord = vec2(dx * floor(q.x / dx), dy * floor(q.y / dy));",
      "float Dist = sqrt(((q.x - 0.5) * (q.x - 0.5) + (q.y - 0.5) * (q.y - 0.5)));",
      "float Fist = sqrt(((q.x - 0.5) * (q.x - 0.5) - (q.y - 0.5) * (q.y - 0.5)));",
      "vec4 color = texture2D( tDiffuse, Coord / vec2(Coord + (Dist/Coord)) );",
      "vec4 folor = texture2D( tDiffuse, Coord / vec2(Coord + (Fist/Coord)) );",
      "vec4 original = texture2D( tDiffuse, q );",

      "float average = ( color.r + color.g + color.b ) / 3.0;",

      "gl_FragColor = vec4( ",
      "color.r,",
      "color.g,",
      "color.b,",
      // "original.r + (color.r * 0.5),",
      // "original.g + (color.g * 0.5),",
      // "original.b + (color.b * 0.5),",
      // "sin((color.r * 255.0) + pattern()),",
      // "sin((color.g * 255.0) + pattern()),",
      // "sin((color.b * 255.0) + pattern()),",
      "color.a);",
    "}"

  ].join( "\n" )

};
