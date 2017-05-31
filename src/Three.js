import * as THREE from 'three'; // build/three.js from node_module/three
window.THREE = THREE;
require('three/examples/js/controls/OrbitControls.js');
require('three/examples/js/shaders/FresnelShader');
require('three/examples/js/effects/AnaglyphEffect.js');
// require('three/examples/js/controls/FirstPersonControls.js');
export default THREE;
// Importing plugin packages with THREE.js
// Code from StackOverflow: https://tinyurl.com/kr3kp7p
