/* eslint-disable */
THREE.RenderFragment = {

	uniforms: {

		"tDiffuse": { value: null },
		"aspect":    { value: new THREE.Vector2( 512, 512 ) }
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"varying vec2 vUv;",
		"uniform vec2 aspect;",


		"vec2 texel = vec2(1.0 / aspect.x, 1.0 / aspect.y);",

		"mat3 G[2];",

		"const mat3 g0 = mat3( 1.0, 2.0, 1.0, 0.0, 0.0, 0.0, -1.0, -2.0, -1.0 );",
		"const mat3 g1 = mat3( 1.0, 0.0, -1.0, 2.0, 0.0, -2.0, 1.0, 0.0, -1.0 );",


		"void main(void)",
		"{",
			"mat3 I;",
			"float cnv[2];",
      "float fcAmount;",
			"vec3 sample;",
			"vec2 q = vUv;",
			"G[0] = g0;",
			"G[1] = g1;",

			/* fetch the 3x3 neighbourhood and use the RGB vector's length as intensity value */
			"for (float i=0.0; i<3.0; i++)",
			"for (float j=0.0; j<3.0; j++) {",
				"sample = texture2D( tDiffuse, vUv + texel * vec2(i-1.0,j-1.0) ).rgb;",
				"I[int(i)][int(j)] = length(sample);",
			"}",

			/* calculate the convolution values for all the masks */
			"for (int i=0; i<2; i++) {",
				"float dp3 = dot(G[i][0], I[0]) + dot(G[i][1], I[1]) + dot(G[i][2], I[2]);",
				"cnv[i] = dp3 * dp3; ",
			"}",
			"fcAmount = sqrt(cnv[0]*cnv[0]+cnv[1]*cnv[1]) * 0.2;",
			"gl_FragColor = vec4(",
				"fcAmount - (1.0 - sin(fcAmount - 6.25 * q.x)) / 2.0,",
				"fcAmount - (1.0 + cos(fcAmount + 6.25 * q.x)) / 2.0,",
				"fcAmount - (1.0 - sin(fcAmount + 6.25 * q.x)) / 2.0,",
				// "fcAmount - (1.0 - sin(fcAmount - 6.1 * q.x)) / 2.0,",
				// "fcAmount - (1.0 - sin(fcAmount + 6.1 * q.x)) / 2.0,",
				// "fcAmount - (1.0 + cos(fcAmount + 6.1 * q.x)) / 2.0,",
				// "fcAmount - sin(fcAmount - 2.65 * q.x),",
				// "fcAmount + cos(fcAmount + 2.65 * q.x),",
				// "fcAmount - sin(fcAmount + 2.65 * q.x),",
			"1.0);",
			/* "gl_FragColor = vec4(q.y * fcAmount, q.xø * fcAmount, q.y / q.x * fcAmount, 1.0);", */
		"} "

	].join( "\n" )

};
