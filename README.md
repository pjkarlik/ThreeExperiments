![travis ci build](https://travis-ci.org/pjkarlik/ThreeExperiments.svg?branch=master)
![webpack2](https://img.shields.io/badge/webpack-2.0-brightgreen.svg) ![version](https://img.shields.io/badge/version-0.1.0-yellow.svg) ![frontend](https://img.shields.io/badge/webgl-GLSL-blue.svg)

# ThreeJS Experiments

  My current THREE.js experiments and demos set up with a base sky light box and reflection/refraction maps. Currently getting some warnings but still renders.. texture issues..

  Each render.js file is a mutation or experiment that can be pointed to in index.js

  /src/Three.js is the import file that combines all required Three.js package files..

  ```
  import * as THREE from 'three'; // build/three.js from node_module/three
  window.THREE = THREE;
  require('three/examples/js/controls/OrbitControls.js');
  require('three/examples/js/shaders/FresnelShader');
  // ...etc for other items like Render Passes and Shaders
  ```

  Current Mapping..
  index.js points to => ObjectMaterials.js


  TODO:// Cleaning up default code, next to do some model loading and management.

  http://blacklavalamp.surge.sh/ - AbstractPortalRender.js


## Run the example
  Requires Node v7.0.0 or greater

```bash
$ yarn install
$ yarn dev & open http://localhost:2020
```

## License

[MIT]
