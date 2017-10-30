/* eslint-disable */
THREE.RenderFragment = {
  	uniforms: {

  		"tDiffuse": { value: null },
  		"tSize":    { value: new THREE.Vector2( 256, 256 ) },
  		"center":   { value: new THREE.Vector2( 0.5, 0.5 ) },
  		"ratio":    { value: 1024.0 },
      "frenz":    { value: 1024.0 },
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
      "uniform float frenz;",
  		"uniform vec2 tSize;",
  		"uniform sampler2D tDiffuse;",
  		"varying vec2 vUv;",

			"float pattern() {",
				"vec2 q = vUv;",
				"float s = sin( 1.57 ), c = cos( 1.57 );",

				"vec2 tex = vUv * tSize - center;",
				"vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * (ratio / 32.0);",
        "float Dist = sqrt((q.x -tex.x) * (q.x - tex.x) + (q.y - tex.y) * (q.y - tex.y));",
				"return ( sin( point.x ) * sin( point.y ) ) * 4.0;",

			"}",

  		"void main() {",
				"vec2 q = vUv;",
				"float Pixels = ratio;",
        "float Phase = frenz;",
        "float Adj = 0.5 - (frenz * 0.0001);",
        "float dx = scale * (1.0 / Pixels);",
        "float dy = scale * (1.0 / Pixels);",
        "vec2 Coord = vec2(dx * floor(q.x / dx), dy * floor(q.y / dy));",
        "float Dist = sqrt(((q.x - Adj) * (q.x - Adj) + (q.y - Adj) * (q.y - Adj)));",
  			"vec4 color = texture2D( tDiffuse, Coord);",
				"float average = ( color.r + color.g + color.b ) / 32.0;",
				// "gl_FragColor = vec4( vec3(average + sin((average * 8.0 - 5.0)) * 0.25), color.a );",
  			"gl_FragColor = vec4(",
					"color.r + sin((color.r * 10.0 - 5.0)) * 0.25,",
					"color.g + sin((color.g * 9.0 - 4.0)) * 0.25, ",
					"color.b + sin((color.b * 8.0 - 3.0)) * 0.25,",
					"color.a",
				");",

  		"}"

  	].join( "\n" )

  };
