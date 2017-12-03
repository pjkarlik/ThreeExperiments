import * as THREE from 'three';

window.hasNativeWebVRImplementation = !!navigator.getVRDisplays || !!navigator.getVRDevices;
window.WebVRConfig = {BUFFER_SCALE: 1.0};

window.THREE = THREE;
require('three/examples/js/CurveExtras.js');
require('three/examples/js/controls/OrbitControls.js');
require('three/examples/js/shaders/CopyShader.js');
require('three/examples/js/shaders/MirrorShader');
require('three/examples/js/postprocessing/EffectComposer.js');
require('three/examples/js/postprocessing/RenderPass.js');
require('three/examples/js/postprocessing/ShaderPass.js');

export default THREE;
