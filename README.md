![travis ci build](https://travis-ci.org/pjkarlik/ThreeExperiments.svg?branch=master)

# ThreeJS Experiments

![version](https://img.shields.io/badge/version-0.2.0-e05d44.svg?style=flat-square) ![threejs](https://img.shields.io/badge/threejs-0.100.0-e09844.svg?style=flat-square) ![webpack](https://img.shields.io/badge/webpack-4.12.1-51b1c5.svg?style=flat-square)  ![WebGL](https://img.shields.io/badge/webgl-GLSL-blue.svg?style=flat-square)

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
  - [Webcam](https://3draster.surge.sh/)
  - [Bloommirror](http://bloommirror.surge.sh/)
  - [Bloomdrift](http://bloomdrift.surge.sh/)
  - [TunnelLogicRender](http://tunneldemo.surge.sh/)
  - [AbstractPortalRender](http://blacklavalamp.surge.sh/)
  - [LiquidLandscape](http://threeboilerplate-light.surge.sh/)
  - [SkullRender](http://threeexperiments-skull.surge.sh/)
  - [Build History](https://travis-ci.org/pjkarlik/ThreeExperiments/)

## Run the example
  Requires Node v8.9.2 or greater

```bash
$ yarn install
$ yarn dev & open http://localhost:2022
```
