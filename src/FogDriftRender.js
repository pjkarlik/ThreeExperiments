import dat from 'dat-gui';
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
    this.amount = 30;
    this.size = 70;
    this.time = 0;
    this.frame = 0;
    this.speed = 1.4;
    this.strength = 80;
    this.iteration = 60;
    this.background = 0x14313e;
    this.fog = this.background; // 0xefd1b5;
    this.objects = [];
    this.generator = new Generator(10);
    window.addEventListener('resize', this.resize, true);
    // window.addEventListener('click', this.stats, true);
    this.createGUI();
    this.setViewport();
    this.setRender();
    this.renderLoop();
  }

  createGUI = () => {
    this.options = {
      strength: this.strength,
      color: [20, 50, 65],
      iteration: this.iteration,
    };
    this.gui = new dat.GUI();

    const folderRender = this.gui.addFolder('Render Options');
    folderRender.add(this.options, 'strength', 1, 100).step(1)
      .onFinishChange((value) => { this.strength = value; });
    folderRender.add(this.options, 'iteration', 1, 100).step(1)
      .onFinishChange((value) => { this.iteration = value; });
    folderRender.addColor(this.options, 'color')
      .onChange((value) => {
        this.color = this.rgbToHex(~~(value[0]), ~~(value[1]), ~~(value[2]));
        // this.planeMesh.material.color.setHex(this.color);
        this.scene.fog.color.setHex(this.color);
      });

    folderRender.open();
  };

  setRender = () => {
    // Set Render and Scene //
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.devicePixelRatio);
    this.renderer.shadowMapEnabled = true;
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(this.fog, 0.00115);
    this.camera = new THREE.PerspectiveCamera(
        this.viewAngle,
        this.aspect,
        this.near,
        this.far
    );
    this.scene.add(this.camera);
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
    const iteration = this.iteration * 0.0015;
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
    const timeStop = this.time * iteration;
    for (let y = 0; y < this.amount; y++) {
      for (let x = 0; x < this.amount; x++) {
        const object = this.objects[x + (y * this.amount)];
        const noiseX = this.generator.simplex3(x * iteration, y * iteration + timeStop, 0) * 7;
        const px = (-offset) + (x * size);
        const py = noiseX * this.strength;
        const pz = (-offset) + (y * size);
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

  rgbToHex = (r, g, b) => {
    const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return `0x${hex}`;
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
