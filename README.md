![travis ci build](https://travis-ci.org/pjkarlik/ThreeExperiments.svg?branch=master)
![webpack3](https://img.shields.io/badge/webpack-3.0-brightgreen.svg) ![version](https://img.shields.io/badge/version-0.1.2-yellow.svg) ![webgl](https://img.shields.io/badge/webgl-GLSL-blue.svg)

# ThreeJS Experiments

  My current THREE.js experiments and demos set up with a base sky light box and reflection/refraction maps. Currently getting some warnings but still renders.. texture issues..

  Each subfolder/index.js file is a mutation or experiment that can be pointed to from the parent src/index.js

  /src/Three.js is the import file that combines all required Three.js package files into a window global.

  ```
  import * as THREE from 'three'; // build/three.js from node_module/three
  window.THREE = THREE;
  require('three/examples/js/controls/OrbitControls.js');
  require('three/examples/js/shaders/FresnelShader');
  // ...etc for other items like Render Passes and Shaders
  ```

  Current Mapping --> ```index.js``` --> (render file) ```SimplexRender\index.js```


  TODO:// Cleaning up default code, next to do some model loading and management.

  - [TunnelLogicRender.js](http://tunneldemo.surge.sh/)
  - [AbstractPortalRender.js](http://blacklavalamp.surge.sh/)
  - [LiquidLandscape.js](http://threeboilerplate-light.surge.sh/)
  - [SkullRender.js](http://threeexperiments-skull.surge.sh/)
  - [Build History](https://travis-ci.org/pjkarlik/ThreeExperiments/)

## Run the example
  Requires Node v7.0.0 or greater

```bash
$ yarn install
$ yarn dev & open http://localhost:2020
```

## License

[MIT]
