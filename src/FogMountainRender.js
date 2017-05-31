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
    this.near = 1;
    this.far = 10000;
    this.amount = 200;
    this.size = 2000;
    this.spacing = this.size / this.amount;
    this.strength = 0.5;
    this.timer = 0;
    this.time = 0;
    this.frame = 0;
    this.speed = 1;
    this.iteration = 0.08;
    this.background = 0xf50055;
    this.fog = this.background; // 0xefd1b5;
    this.points = [];
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
    this.camera.position.set(-530, 420, -425);
    this.camera.lookAt(this.scene.position);

    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxDistance = 3000;
    this.controls.minDistance = 0.1;

    // Set AmbientLight //
    // this.ambient = new THREE.AmbientLight(0x6699aa);
    // this.ambient.position.set(0, 0, 0);
    // this.scene.add(this.ambient);
    this.spotLight = new THREE.DirectionalLight(0x6699aa);
    this.spotLight.position.set(-30, 60, 60);
    this.spotLight.castShadow = true;
    this.scene.add(this.spotLight);
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    this.skybox.mapping = THREE.CubeReflectionMapping; // CubeReflectionMapping || CubeRefractionMapping

    const skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
    const skyBoxMaterial = new THREE.MeshBasicMaterial({ color: this.background, side: THREE.BackSide });
    this.lowSkybox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    this.scene.add(this.lowSkybox);

    const meshMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      envMap: this.skybox,
      side: THREE.DoubleSide
    });
    meshMaterial.wrapS = meshMaterial.wrapT = THREE.RepeatWrapping;
    this.geometry = new THREE.PlaneBufferGeometry(this.size, this.size, this.amount, this.amount);
    this.planeMesh = new THREE.Mesh(
      this.geometry,
      meshMaterial
    );

    this.planeMesh.rotation.set(90 * Math.PI / 180, 0, 0);
    this.planeMesh.position.set(0, 0, 0);
    this.scene.add(this.planeMesh);
  };

  checkObjects = () => {
    this.timer += 0.005;
    this.time += 0.1;
    const timeStop = this.time * this.iteration;

    const offset = this.size / 2;
    const vertices = this.geometry.attributes.position.array;

    for (let y = 0; y < this.amount + 1; y ++) {
      for (let x = 0; x < this.amount + 1; x ++) {
        const vx = x * 3;
        const vy = y * ((this.amount + 1) * 3);

        const noiseX = this.generator.simplex3(
          x * this.iteration,
          y * this.iteration + timeStop,
          0,
        );
        vertices[vy + vx + 0] = (-offset) + x * this.spacing;
        vertices[vy + vx + 1] = ((-offset) + y * this.spacing)
        vertices[vy + vx + 2] = noiseX * 100;
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();
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
    this.renderer.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.checkObjects();
    this.renderScene();
    window.requestAnimationFrame(this.renderLoop);
  };
}
