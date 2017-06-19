import THREE from './Three';
import { Generator } from './SimplexNoise';
// import dat from 'dat-gui';

// Skybox image imports //
import xpos from '../resources/images/stairs/posx.jpg';
import xneg from '../resources/images/stairs/negx.jpg';
import ypos from '../resources/images/stairs/posy.jpg';
import yneg from '../resources/images/stairs/negy.jpg';
import zpos from '../resources/images/stairs/posz.jpg';
import zneg from '../resources/images/stairs/negz.jpg';
// Mesh Textures //
import grass01 from '../resources/images/grass02.jpg';
import skullModel from '../resources/models/polyskull.json';

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
    this.setSkyBox();
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
    this.camera.position.set(0, 20, -50);
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
    const texloader = new THREE.TextureLoader();
    const grassMap = texloader.load(grass01);

    grassMap.wrapS = grassMap.wrapT = THREE.RepeatWrapping;
    grassMap.repeat.x = grassMap.repeat.y = 6;

    this.planeMesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(500, 500, 20, 20),
      new THREE.MeshPhongMaterial({
        map: grassMap,
        side: THREE.DoubleSide,
      })
    );

    // this.planeMesh.rotation.set(90 * Math.PI / 180, 0, 0);
    // this.planeMesh.position.set(0, this.floor, 0);
    // this.scene.add(this.planeMesh);

    this.refractCamera = new THREE.CubeCamera(0.1, 5000, 512);
    this.refractCamera.position.set(0, 0, 0);
    this.scene.add(this.refractCamera);

    this.fShader = THREE.FresnelShader;
    const fresnelUniforms = {
      mRefractionRatio: { type: 'f', value: 1.502 },
      mFresnelBias: { type: 'f', value: 0.51 },
      mFresnelPower: { type: 'f', value: 1.0 },
      mFresnelScale: { type: 'f', value: 0.75 },
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

    // this.skull.position.set(0, 0, 0);
    // this.scene.add(this.skull);

    // this.sphereRing = new THREE.Mesh(
    //   new THREE.TorusBufferGeometry(10, 1, 10, 50),
    //   this.dynamicReflection
    // );
    // this.sphereRing.position.set(0, 0, 0);
    // this.scene.add(this.sphereRing);
  };

  camearAnimation = () => {
    this.camera.position.y = 330 + Math.sin(this.timer + 2 * Math.PI / 180) * 150;
    // this.camera.position.x = Math.cos(this.timer + Math.PI / 180) * 120;
    this.camera.position.z = 330 - Math.cos(this.timer + Math.PI / 180) * 200;
    this.camera.lookAt(this.scene.position);
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

  renderScene = () => {
    this.skullObject.visible = false;
    this.refractCamera.updateCubeMap(this.renderer, this.scene);
    this.skullObject.visible = true;
    this.renderer.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.frame ++;
    this.checkObjects();
    this.renderScene();
    window.requestAnimationFrame(this.renderLoop);
  };

  // DATGUI STUFF HERE //
  createGUI = () => {
  };
}
