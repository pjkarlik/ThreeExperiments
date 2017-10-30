/* eslint-disable */
THREE.RenderFragment = {
  	uniforms: {

  		"tDiffuse": { value: null },
  		"tSize":    { value: new THREE.Vector2( 256, 256 ) },
  		"center":   { value: new THREE.Vector2( 0.5, 0.5 ) },
  		"angle":    { value: 1.57 },
  		"scale":    { value: 1.0 }

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
  		"uniform float angle;",
  		"uniform float scale;",
  		"uniform vec2 tSize;",

  		"uniform sampler2D tDiffuse;",

  		"varying vec2 vUv;",

  		"float pattern() {",
				"vec2 q = vUv;",
  			"float s = sin( angle ), c = cos( angle );",

  			"vec2 tex = vUv * tSize - center;",
  			"vec2 point = vec2( c * tex.x - s * q.y, s * tex.x + c * q.x ) * scale;",

  			"return ( sin( point.x ) * sin( point.y ) ) * 4.0;",

  		"}",

  		"void main() {",
				"vec2 q = vUv;",
  			"vec4 color = texture2D( tDiffuse, vUv );",

  			"float average = ( color.r + color.g + color.b ) / 3.0;",
				//"gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );",
  			"gl_FragColor = vec4(",
					"color.r * 12.0 - 5.0 - pattern(), ",
					"color.g * 8.0 - 5.0 - pattern(), ",
					"color.b * 6.0 - 5.0 - pattern(), ",
					//"average - (255.0 * cos(average + 6.0 * q.x)) / 2.0,",
					// "(255.0 * sin(average * q.x * 3.125 / 180.0)),",
					// "(255.0 * sin(average * q.x * 3.125 / 180.0)),",
					// "(255.0 * sin(average * q.x * 3.125 / 180.0)),",
					"color.a",
				");",

  		"}"

  	].join( "\n" )

  };
