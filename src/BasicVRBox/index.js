import THREE from '../Three';

console.log(window);
// import 'webvr-polyfill';
// WebVR Imports //
import VRControls from 'three-vrcontrols-module';
import VREffect from 'three-vreffect-module';
import * as WebvrUI from 'webvr-ui/build/webvr-ui';

// Skybox image imports //
import xpos from '../../resources/images/chapel/posx.jpg';
import xneg from '../../resources/images/chapel/negx.jpg';
import ypos from '../../resources/images/chapel/posy.jpg';
import yneg from '../../resources/images/chapel/negy.jpg';
import zpos from '../../resources/images/chapel/posz.jpg';
import zneg from '../../resources/images/chapel/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.controls;
    this.scene;
    this.camera;
    this.render;
    this.vrDisplay;
    // CREATE VR //
    const UI = document.createElement('div');
    UI.setAttribute('id', 'ui');
    UI.style.position = 'fixed';
    UI.style.bottom = '10px';
    UI.style.left = '50%';
    UI.style.transform = 'translate(-50%, -50%)';
    UI.style.textAlign = 'center';
    UI.style.fontFamily = 'sans-serif';
    UI.style.zIndex = '10';

    const VR_BTN = document.createElement('div');
    VR_BTN.setAttribute('id', 'vr-button');

    const MAGIC_WIN = document.createElement('a');
    MAGIC_WIN.setAttribute('id', 'magic-window');
    MAGIC_WIN.setAttribute('href', '#');
    MAGIC_WIN.style.display = 'block';
    MAGIC_WIN.style.color = 'white';
    MAGIC_WIN.style.marginTop = '1em';

    const MAGIC_TXT = document.createTextNode('Try it without a headset');

    MAGIC_WIN.appendChild(MAGIC_TXT);
    UI.appendChild(VR_BTN);
    UI.appendChild(MAGIC_WIN);
    document.body.appendChild(UI);






    this.vrButton.getVRDisplay().then((display) => {
      if (display) {
        this.renderer.vr.setDevice(display);
      }
    }).catch((e) => {
      if (e.message === 'No displays found') {
        console.log('No VR Display Found');
      } else {
        return e;
      }
    });

    navigator.getVRDisplays().then((displays) => {
      if (displays.length > 0) {
        this.vrDisplay = displays[0];
        this.vrDisplay.requestAnimationFrame(this.render);
      }
    });
    // END VR // 
    window.addEventListener('resize', this.resize, true);
    window.addEventListener('vrdisplaypresentchange', this.resize, true);

    this.setViewport();
    this.setRender();
    this.renderLoop();
  }

  setRender = () => {
    // Set Initial Render Stuff //
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(this.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    this.effect = this.effect = new VREffect(this.renderer);
    this.effect.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
        this.viewAngle,
        this.aspect,
        this.near,
        this.far
    );
    this.camera.position.set(0, 1, -3);
    this.camera.lookAt(new THREE.Vector3());

    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxDistance = 1500;
    this.controls.minDistance = 0;

    // Set AmbientLight //
    this.ambient = new THREE.AmbientLight(0xFFFFFF);
    this.ambient.position.set(0, 0, 0);
    this.scene.add(this.ambient);

    // Skybox //
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    const skybox = new THREE.CubeTextureLoader().load(urls);
    skybox.format = THREE.RGBFormat;
    skybox.mapping = THREE.CubeRefractionMapping;
    this.scene.background = skybox;
  };

  setViewport = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.viewAngle = 60;
    this.aspect = this.width / this.height;
    this.near = 1;
    this.far = 1000;
    this.devicePixelRatio = window.devicePixelRatio;
  };

  resize = () => {
    this.setViewport();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  renderLoop = () => {
    this.effect.render(this.scene, this.camera);
    this.vrDisplay.requestAnimationFrame(this.render);
    if (this.vrButton.isPresenting()) {
      this.controls.update();
    }
  };
}
