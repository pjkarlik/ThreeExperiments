![travis ci build](https://travis-ci.org/pjkarlik/ThreeExperiments.svg?branch=master)

# ThreeJS Imports

  THREE is initialized in its own module scope, and not global scope, and it's not being exported. The problem is other packages and scripts are looking for THREE in its module scope and then in the global scope. So THREE is not found and error is thrown.

  To Fix this Import threejs as shown below, then add to the global window scope. Other items such as OrbitControls are then required into the index.js file on load.

  ```
  // Import ThreeJS from npm package    //
  import * as THREE from 'three';
  // Global Scope to window             //
  window.THREE = THREE;

  require('three/examples/js/controls/OrbitControls.js');
  require('three/examples/js/effects/AnaglyphEffect.js');

  // comment out what is not needed     //
  require('three/examples/js/shaders/CopyShader.js');
  require('three/examples/js/shaders/MirrorShader');
  require('three/examples/js/postprocessing/EffectComposer.js');
  require('three/examples/js/postprocessing/RenderPass.js');
  require('three/examples/js/postprocessing/ShaderPass.js');

  export default THREE;
  ```
