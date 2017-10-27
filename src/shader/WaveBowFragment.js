/**
 * @author zz85 / https://github.com/zz85 | https://www.lab4games.net/zz85/blog
 *
 * Edge Detection Shader using Sobel filter
 * Based on http://rastergrid.com/blog/2011/01/frei-chen-edge-detector
 *
 * aspect: vec2 of (1/width, 1/height)
 */
/* eslint-disable */
THREE.WaveBowFragment = {
  	uniforms: {

  		"tDiffuse": { value: null },
  		"tSize":    { value: new THREE.Vector2( 256, 256 ) },
  		"center":   { value: new THREE.Vector2( 0.5, 0.5 ) },
  		"ratio":    { value: 512.0 },
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
  		"uniform vec2 tSize;",
  		"uniform sampler2D tDiffuse;",
  		"varying vec2 vUv;",

			"float pattern() {",
				"vec2 q = vUv;",
				"float s = sin( 1.75 ), c = cos( 1.75 );",

				"vec2 tex = vUv * tSize - center;",
				"vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * (ratio / 32.0);",

				"return ( sin( point.x ) * sin( point.y ) ) * 4.0;",

			"}",

  		"void main() {",
				"vec2 q = vUv;",
				"float Pixels = ratio;",
        "float dx = scale * (1.0 / Pixels);",
        "float dy = scale * (1.0 / Pixels);",
        "vec2 Coord = vec2(dx * floor(q.x / dx), dy * floor(q.y / dy));",
  			"vec4 color = texture2D( tDiffuse, Coord);",
				"float average = ( color.r + color.g + color.b ) / 2.0;",
				"gl_FragColor = vec4( vec3(sin(average * 10.0 - 5.0 / q.y) * 255.0), color.a );",
  			// "gl_FragColor = vec4(",
				// 	"sin(color.r * 10.0 - 5.0 / q.y) * 255.0,",
				// 	"sin(color.g * 8.0 - 4.0 / q.y) * 255.0, ",
				// 	"sin(color.b * 6.0 - 3.0 / q.y) * 255.0,",
				// 	"color.a",
				// ");",

  		"}"

  	].join( "\n" )

  };