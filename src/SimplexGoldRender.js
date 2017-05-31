import THREE from './Three';
import { Generator } from './SimplexNoise';

// Skybox image imports //
import xpos from '../resources/images/chapel/posx.jpg';
import xneg from '../resources/images/chapel/negx.jpg';
import ypos from '../resources/images/chapel/posy.jpg';
import yneg from '../resources/images/chapel/negy.jpg';
import zpos from '../resources/images/chapel/posz.jpg';
import zneg from '../resources/images/chapel/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.viewAngle = 55;
    this.near = 0.1;
    this.far = 20000;
    this.amount = 10;
    this.size = 0.1;
    this.strength = 0.5;
    this.time = 0;
    this.frame = 0;
    this.speed = 1;
    this.iteration = 0.05;
    this.objects = [];
    this.generator = new Generator(10);
    this.clock = new THREE.Clock();
    window.addEventListener('resize', this.resize, true);
    this.setViewport();
    this.setRender();
    this.renderLoop();
  }

  setRender = () => {
    // Set Render and Scene //
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.devicePixelRatio);
    this.renderer.shadowMapEnabled = true;
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xefd1b5, 0.0025);
    this.camera = new THREE.PerspectiveCamera(
        this.viewAngle,
        this.aspect,
        this.near,
        this.far
    );
    this.scene.add(this.camera);

    this.camera.position.set(0, 1, -3);
    this.camera.lookAt(new THREE.Vector3(0, 1, 2));
    this.camera.lookAt(this.scene.position);

    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxDistance = 3000;
    this.controls.minDistance = 0.1;

    // Set AmbientLight //
    // this.ambient = new THREE.AmbientLight(0xFFFFFF);
    // this.ambient.position.set(0, 0, 0);
    // this.scene.add(this.ambient);
    this.spotLight = new THREE.DirectionalLight(0xFFFFFF);
    this.spotLight.position.set(-30, 60, 60);
    this.spotLight.castShadow = true;
    this.scene.add(this.spotLight);
    // Skybox //
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    this.skybox.mapping = THREE.CubeReflectionMapping; // CubeReflectionMapping || CubeRefractionMapping
    // this.scene.background = this.skybox;

    this.metalMaterial = new THREE.MeshBasicMaterial({
      envMap: this.skybox,
    });
    this.stockMaterial = new THREE.MeshLambertMaterial({
      color: 0xaeaeae,
    });

    this.randomObjects();

    this.effect = new THREE.AnaglyphEffect(this.renderer);
    this.effect.setSize(this.width, this.height);
  };

  randomObjects = () => {
    for (let y = 0; y < this.amount; y++) {
      for (let x = 0; x < this.amount; x++) {
        const object = new THREE.Mesh(
          new THREE.CubeGeometry(this.size, this.size, this.size),
          this.metalMaterial,
        );
        this.objects.push(object);
        this.scene.add(object);
      }
    }
  };

  checkObjects = () => {
    const size = this.size * 1.25;
    const offset = this.amount * (size / 2) - (size / 2);
    // advance time and tick draw loop for time segment
    this.time += 1;

    for (let y = 0; y < this.amount; y++) {
      for (let x = 0; x < this.amount; x++) {
        const object = this.objects[x + (y * this.amount)];
        const noiseX = this.generator.simplex3(x * this.iteration, y * this.iteration, this.time * 0.01);
        const px = (-offset) + (x * size);
        const py = -(noiseX * this.strength);
        const pz = (-offset) + (y * size);
        object.position.set(px, py, pz);
      }
    }
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
    this.effect.setSize(this.width, this.height);
  };

  renderScene = () => {
    this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.checkObjects();
    this.renderScene();
    window.requestAnimationFrame(this.renderLoop);
  };
}
