![travis ci build](https://travis-ci.org/pjkarlik/ThreeExperiments.svg?branch=master)

# ThreeJS Imports

  THREE is initialized in its own module scope, and not a global scope. The problem is other packages and scripts are looking for THREE in its module scope and then in the global scope. So THREE is not found and error is thrown.

  To Fix this Import threejs as shown below, then add to the global window scope. Other items such as OrbitControls are then required into the index.js file on load.

  ```
  import * as THREE from 'three';   // Import ThreeJS from npm package
  window.THREE = THREE;             // Global Scope to window

  require('three/examples/js/controls/OrbitControls.js');
  require('three/examples/js/effects/AnaglyphEffect.js');

                                    // Other package imports
  require('three/examples/js/shaders/CopyShader.js');
  require('three/examples/js/shaders/MirrorShader');
  require('three/examples/js/postprocessing/EffectComposer.js');
  require('three/examples/js/postprocessing/RenderPass.js');
  require('three/examples/js/postprocessing/ShaderPass.js');

  export default THREE;
  ```
