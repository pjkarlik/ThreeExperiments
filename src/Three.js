import * as THREE from 'three';

window.THREE = THREE;
require('three/examples/js/CurveExtras.js');
require('three/examples/js/controls/OrbitControls.js');
require('three/examples/js/shaders/FresnelShader');
require('three/examples/js/effects/AnaglyphEffect.js');
require('three/examples/js/effects/StereoEffect.js');

// require('three/examples/js/controls/FirstPersonControls.js');
require('three/examples/js/shaders/CopyShader.js');
require('three/examples/js/shaders/KaleidoShader.js');
require('three/examples/js/shaders/EdgeShader2.js');
require('three/examples/js/shaders/DotScreenShader.js');
require('three/examples/js/shaders/RGBShiftShader.js');
require('three/examples/js/shaders/MirrorShader');
require('three/examples/js/shaders/EdgeShader');
require('three/examples/js/postprocessing/EffectComposer.js');
require('three/examples/js/postprocessing/RenderPass.js');
require('three/examples/js/postprocessing/ShaderPass.js');

export default THREE;
// Importing plugin packages with THREE.js
// Code from StackOverflow: https://tinyurl.com/kr3kp7p
