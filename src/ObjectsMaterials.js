import THREE from './Three';
import { Generator } from './SimplexNoise';
import dat from 'dat-gui';

// Skybox image imports //
import xpos from '../resources/images/church/posx.jpg';
import xneg from '../resources/images/church/negx.jpg';
import ypos from '../resources/images/church/posy.jpg';
import yneg from '../resources/images/church/negy.jpg';
import zpos from '../resources/images/church/posz.jpg';
import zneg from '../resources/images/church/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.viewAngle = 55;
    this.near = 1;
    this.far = 10000;
    this.frame = 0;
    this.background = 0xDDDDDD;
    this.fog = this.background;
    this.generator = new Generator(10);
    window.addEventListener('resize', this.resize, true);
    // this.createGUI();
    this.setViewport();
    this.init();
    this.renderLoop();
  }
  init = () => {
    this.setRender();
    this.setCamera();
    this.setControls();
    this.setLights();
    this.setScene();
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
    this.camera.position.set(0, 0, 0);
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
    this.ambient.position.set(0, 50, 0);
    this.scene.add(this.ambient);

    // this.spotLight = new THREE.DirectionalLight(0x0666666);
    // this.spotLight.position.set(-600, 200, 230);
    // this.spotLight.castShadow = true;
    // this.scene.add(this.spotLight);
  };
  setScene = () => {
    // this.scene.fog = new THREE.FogExp2(this.fog, 0.00145);

    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    this.skybox.mapping = THREE.CubeReflectionMapping; // CubeReflectionMapping || CubeRefractionMapping
    this.scene.background = this.skybox;

    // this.meshMaterial = new THREE.MeshPhongMaterial({
    //   envMap: this.skybox,
    //   side: THREE.DoubleSide,
    // });
    // this.meshMaterial.wrapS = this.meshMaterial.wrapT = THREE.RepeatWrapping;
    // this.geometry = new THREE.PlaneBufferGeometry(1000, 1000, 20, 20);
    // this.planeMesh = new THREE.Mesh(
    //   this.geometry,
    //   this.meshMaterial
    // );
    //
    // this.planeMesh.rotation.set(90 * Math.PI / 180, 0, 0);
    // this.planeMesh.position.set(0, 0, 0);
    // this.scene.add(this.planeMesh);
  };

  camearAnimation = () => {
    this.camera.position.y = 330 + Math.sin(this.timer + 2 * Math.PI / 180) * 150;
    // this.camera.position.x = Math.cos(this.timer + Math.PI / 180) * 120;
    this.camera.position.z = 330 - Math.cos(this.timer + Math.PI / 180) * 200;
    this.camera.lookAt(this.scene.position);
  };

  checkObjects = () => {
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
    this.renderScene();
    window.requestAnimationFrame(this.renderLoop);
  };

  // DATGUI STUFF HERE //
  createGUI = () => {
  };
}
