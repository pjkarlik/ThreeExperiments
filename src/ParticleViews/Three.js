import * as THREE from 'three';

window.THREE = THREE;

require('three/examples/js/controls/OrbitControls.js');

// Can comment out what is not needed //
// require('three/examples/js/controls/FirstPersonControls.js');
require('three/examples/js/shaders/CopyShader.js');
require('three/examples/js/shaders/RGBShiftShader.js');
require('three/examples/js/shaders/MirrorShader');

require('three/examples/js/postprocessing/EffectComposer.js');
require('three/examples/js/postprocessing/RenderPass.js');
require('three/examples/js/postprocessing/ShaderPass.js');

require('three/examples/js/postprocessing/UnrealBloomPass.js');
require('three/examples/js/shaders/LuminosityHighPassShader');
export default THREE;

// Importing plugin packages with THREE.js
// Code from StackOverflow: https://tinyurl.com/kr3kp7p
