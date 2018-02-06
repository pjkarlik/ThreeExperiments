import THREE from '../Three';
import { Generator } from '../utils/SimplexGenerator';
// import dat from 'dat-gui';

// Skybox image imports //
import xpos from '../../resources/images/stairs/posx.jpg';
import xneg from '../../resources/images/stairs/negx.jpg';
import ypos from '../../resources/images/stairs/posy.jpg';
import yneg from '../../resources/images/stairs/negy.jpg';
import zpos from '../../resources/images/stairs/posz.jpg';
import zneg from '../../resources/images/stairs/negz.jpg';
// Mesh Textures //
import skullModel from '../../resources/models/polyskull.json';

// Render Class Object //
export default class Render {
  constructor() {
    this.viewAngle = 55;
    this.near = 1;
    this.far = 10000;
    this.frame = 0;
    this.floor = -45;
    this.background = 0xDDDDDD;
    this.zRotation = -180 * Math.PI / 180;
    this.xRotation = -33 * Math.PI / 180;
    this.fog = this.background;
    this.generator = new Generator(10);
    this.camPosition = {
      x: -15.7881,
      y: -23.118,
      z: -14.03976
    };
    this.trsPosition = {
      x: -15.7881,
      y: -23.118,
      z: -14.03976
    };
    this.camTimeoutx = true;
    this.camTimeouty = true;
    this.camTimeoutz = true;
    setTimeout(
      () => {
        this.canSpeed = true;
        this.camTimeoutx = false;
        this.camTimeouty = false;
        this.camTimeoutz = false;
      },
      3000 + (600 * Math.random() * 10)
    );
    window.addEventListener('resize', this.resize, true);
    window.addEventListener('click', this.stats, true);
    // this.createGUI();
    this.setViewport();
    this.init();
    this.renderLoop();
  }

  init = () => {
    this.setRender();
    this.setCamera();
    this.setControls();
    this.setSkyBox();
    this.setLights();
    this.setScene();
  };

  stats = () => {
    console.log(this.camera.position);
  };

  setRender = () => {
    // Set Render and Scene //
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.devicePixelRatio);
    this.renderer.shadowMapEnabled = true;
    document.body.appendChild(this.renderer.domElement);
    // Root Scene Element //
    this.scene = new THREE.Scene();
  };

  setCamera = () => {
    this.camera = new THREE.PerspectiveCamera(
        this.viewAngle,
        this.aspect,
        this.near,
        this.far
    );
    this.scene.add(this.camera);
    this.camera.position.set(0, -12, -24);
    this.camera.lookAt(this.scene.position);
  };

  setControls = () => {
    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxDistance = 3000;
    this.controls.minDistance = 0.1;
  };

  setLights = () => {
    // Set AmbientLight //
    this.ambient = new THREE.AmbientLight(0xAAAAAA);
    this.ambient.position.set(0, 45, 0);
    this.scene.add(this.ambient);

    this.spotLight = new THREE.DirectionalLight(0x0666666);
    this.spotLight.position.set(-6, 30, 80);
    this.spotLight.castShadow = true;
    this.scene.add(this.spotLight);
  };

  setSkyBox = () => {
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    this.skybox.mapping = THREE.CubeReflectionMapping; // CubeReflectionMapping || CubeRefractionMapping
    this.scene.background = this.skybox;
  };

  setScene = () => {
    this.refractCamera = new THREE.CubeCamera(0.1, 5000, 512);
    this.refractCamera.position.set(0, 0, 0);
    this.scene.add(this.refractCamera);

    this.fShader = THREE.FresnelShader;
    const fresnelUniforms = {
      mRefractionRatio: { type: 'f', value: 1.502 },
      mFresnelBias: { type: 'f', value: 0.51 },
      mFresnelPower: { type: 'f', value: 1.0 },
      mFresnelScale: { type: 'f', value: 0.75 },
      // mRefractionRatio: { type: 'f', value: 1.02 },
      // mFresnelBias: { type: 'f', value: 0.1 },
      // mFresnelPower: { type: 'f', value: 1.0 },
      // mFresnelScale: { type: 'f', value: 0.5 },
    };
    this.dynamicReflection = new THREE.ShaderMaterial({
      uniforms: {
        ...fresnelUniforms,
        tCube: { type: 't', value: this.refractCamera.renderTarget.texture },
      },
      vertexShader: this.fShader.vertexShader,
      fragmentShader: this.fShader.fragmentShader,
    });
    const objectLoader = new THREE.ObjectLoader();
    this.skullObject = objectLoader.parse(skullModel);
    this.skullObject.children[0].geometry.dynamic = true;
    // this.skullObject.children[0].rotation.set(0, 0, this.zRotation);
    this.skullObject.children[0].material = this.dynamicReflection;
    this.scene.add(this.skullObject);
  };

  checkObjects = () => {
    const timeStop = this.frame * 0.2;
    const angleRotate = timeStop * Math.PI / 180;
    const timeScale = 3 - Math.sin(angleRotate) * 0.5;
    // this.skullObject.children[0].rotation.y = angleRotate;
    this.skullObject.children[0].scale.set(timeScale, timeScale, timeScale);
  };

  setViewport = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspect = this.width / this.height;
    this.devicePixelRatio = window.devicePixelRatio;
  };

  resize = () => {
    this.setViewport();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  rgbToHex = (r, g, b) => {
    const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return `0x${hex}`;
  };

  cameraLoop = () => {
    const damp = 0.01;
    this.camPosition.x = this.camPosition.x - (this.camPosition.x - this.trsPosition.x) * damp;
    this.camPosition.y = this.camPosition.y - (this.camPosition.y - this.trsPosition.y) * damp;
    this.camPosition.z = this.camPosition.z - (this.camPosition.z - this.trsPosition.z) * damp;

    this.camera.position.set(
      this.camPosition.x,
      this.camPosition.y,
      this.camPosition.z
    );
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    if(!this.camTimeoutx && Math.random() * 280 > 200) {
      const tempRand = 50 + Math.random() * 150;
      this.trsPosition.x = Math.random() * 255 > 200 ?
        Math.random() * 200 > 100 ? -(tempRand) : tempRand : 0;
      this.camTimeoutx = true;
      setTimeout(
        () => { this.camTimeoutx = false; },
        6000 + (1000 * Math.random() * 20)
      );
    }
    if(!this.camTimeouty && Math.random() * 280 > 200) {
      const tempRand = 50 + Math.random() * 150;
      this.trsPosition.y = Math.random() * 255 > 200 ?
        Math.random() * 200 > 100 ? tempRand : -(tempRand) : 0;
      this.camTimeouty = true;
      setTimeout(
        () => { this.camTimeouty = false; },
        6000 + (1000 * Math.random() * 20)
      );
    }
    if(!this.camTimeoutz && Math.random() * 255 > 250) {
      this.trsPosition.z = Math.random() * 200 > 100 ?
        (20 + Math.random() * 20) : -(20 + Math.random() * 20);
      this.camTimeoutz = true;
      setTimeout(
        () => { this.camTimeoutz = false; },
        8000 + (1000 * Math.random() * 25)
      );
    }
  };

  renderScene = () => {
    this.skullObject.visible = false;
    this.refractCamera.updateCubeMap(this.renderer, this.scene);
    this.skullObject.visible = true;
    this.renderer.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.frame ++;
    this.checkObjects();
    this.cameraLoop();
    this.renderScene();
    window.requestAnimationFrame(this.renderLoop.bind(this));
  };

  // DATGUI STUFF HERE //
  createGUI = () => {
  };
}
