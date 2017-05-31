import THREE from './Three';
import { Generator } from './SimplexNoise';

// Skybox image imports //
import xpos from '../resources/images/sky/posx.jpg';
import xneg from '../resources/images/sky/negx.jpg';
import ypos from '../resources/images/sky/posy.jpg';
import yneg from '../resources/images/sky/negy.jpg';
import zpos from '../resources/images/sky/posz.jpg';
import zneg from '../resources/images/sky/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.viewAngle = 55;
    this.near = 0.1;
    this.far = 20000;
    this.amount = 20;
    this.size = 80;
    this.strength = 0.5;
    this.time = 0;
    this.frame = 0;
    this.speed = 1.4;
    this.iteration = 0.05;
    this.background = 0x8fd8fa;
    this.fog = this.background; // 0xefd1b5;
    this.objects = [];
    this.generator = new Generator(10);
    this.clock = new THREE.Clock();
    window.addEventListener('resize', this.resize, true);
    window.addEventListener('click', this.stats, true);
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
    this.scene.fog = new THREE.FogExp2(this.fog, 0.00175);
    this.camera = new THREE.PerspectiveCamera(
        this.viewAngle,
        this.aspect,
        this.near,
        this.far
    );
    this.scene.add(this.camera);

    // this.camera.position.set(92, -180, -330);
    // this.camera.position.set(-142, -85, -345);
    // this.camera.position.set(-530, 420, -745);
    this.camera.position.set(-1281, 514, -409);

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

    const skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
    const skyBoxMaterial = new THREE.MeshBasicMaterial({ color: this.background, side: THREE.BackSide });
    this.lowSkybox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    this.scene.add(this.lowSkybox);

    this.metalMaterial = new THREE.MeshBasicMaterial({
      envMap: this.skybox,
    });

    this.generateObjects();

    this.effect = new THREE.AnaglyphEffect(this.renderer);
    this.effect.setSize(this.width, this.height);
  };

  generateObjects = () => {
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
    this.frame += this.speed;
    if (this.frame > size) {
      // the time phase of the noise wave moves
      // once the cubes moved one space
      this.time += 1;
      this.frame = 0;
    }
    const timeStop = this.time * this.iteration;
    for (let y = 0; y < this.amount; y++) {
      for (let x = 0; x < this.amount; x++) {
        const object = this.objects[x + (y * this.amount)];
        const noiseX = this.generator.simplex3(x * this.iteration, y * this.iteration + timeStop, 0);
        const px = (-offset) + (x * size);
        const py = noiseX * 555;
        const pz = (-offset) + (y * size);
        // object.rotation.set(py * Math.PI / 180, 0, 0)
        object.position.set(px, py, pz - this.frame);
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

  stats = () => {
    console.log(this.camera.position);
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
