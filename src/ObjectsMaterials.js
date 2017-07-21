import THREE from './Three';
import { Generator } from './SimplexNoise';
import fragmentShader from './shader/fragmentShader2';
import vertexShader from './shader/vertexShader2';
// import dat from 'dat-gui';

// Skybox image imports //
import xpos from '../resources/images/tenerife/posx.jpg';
import xneg from '../resources/images/tenerife/negx.jpg';
import ypos from '../resources/images/tenerife/posy.jpg';
import yneg from '../resources/images/tenerife/negy.jpg';
import zpos from '../resources/images/tenerife/posz.jpg';
import zneg from '../resources/images/tenerife/negz.jpg';
import explosion from '../resources/images/rnd.png';
// Mesh Textures //
// import skullModel from '../resources/models/skull.json';
// console.log(skullModel);

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
    this.start = Date.now();
    this.fog = this.background;
    this.generator = new Generator(10);
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
    this.camera.position.set(0, 12, 24);
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
    this.meshMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tExplosion: {
          type: 't',
          value: THREE.ImageUtils.loadTexture(explosion),
        },
        time: {
          type: 'f',
          value: 0.0,
        },
        timeScale: {
          type: 'f',
          value: 2.0,
        }
      },
      vertexShader,
      fragmentShader,
    });
    this.fireball = new THREE.Mesh(
        new THREE.IcosahedronGeometry(7, 4),
        this.meshMaterial
    );
    this.scene.add(this.fireball);

    // const objectLoader = new THREE.ObjectLoader();
    // this.skullObject = objectLoader.parse(skullModel);
    // this.skullObject.children[0].geometry.dynamic = true;
    // this.skullObject.children[0].rotation.set(105 * Math.PI / 180, 0, 0);
    // this.skullObject.children[0].material = this.meshMaterial;
    // this.scene.add(this.skullObject);
  };

  checkObjects = () => {
    const timeStop = this.frame * 0.2;
    const angleRotate = timeStop * Math.PI / 180;
    const timeScale = 1 - Math.sin(angleRotate) * 0.1;
    // this.skullObject.children[0].rotation.y = angleRotate;
    // this.fireball.scale.set(timeScale, timeScale, timeScale);
    this.meshMaterial.uniforms.timeScale.value = timeScale;
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

  renderScene = () => {
    this.renderer.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.frame ++;
    this.meshMaterial.uniforms.time.value = 0.00025 * (Date.now() - this.start);
    this.checkObjects();
    this.renderScene();
    window.requestAnimationFrame(this.renderLoop.bind(this));
  };

  // DATGUI STUFF HERE //
  createGUI = () => {
  };
}
