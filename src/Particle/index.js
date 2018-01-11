import THREE from '../Three';
import Particle from './Particle';

// Skybox image imports //
import xpos from '../../resources/images/church/posx.jpg';
import xneg from '../../resources/images/church/negx.jpg';
import ypos from '../../resources/images/church/posy.jpg';
import yneg from '../../resources/images/church/negy.jpg';
import zpos from '../../resources/images/church/posz.jpg';
import zneg from '../../resources/images/church/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 360;
    this.size = 0.5;
    this.controls = undefined;
    this.scene = undefined;
    this.camera = undefined;
    this.render = undefined;
    this.skybox = undefined;
    this.amount = 30;
    this.particles = [];
    this.box = {
      top: 0,
      left: 0,
      bottom: 10,
      right: 10,
    };
    this.settings = {
      gravity: 0.01,
      bounce: 0.85,
    };
    window.addEventListener('resize', this.resize, true);
    this.setViewport();
    this.setRender();
    this.renderLoop();
  }

  setViewport = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.viewAngle = 85;
    this.aspect = this.width / this.height;
    this.near = 0.1;
    this.far = 20000;
    this.devicePixelRatio = window.devicePixelRatio;
  };

  resize = () => {
    this.setViewport();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  setRender = () => {
    // Set Render and Scene //
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.bufferScene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
        this.viewAngle,
        this.aspect,
        this.near,
        this.far
    );

    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxDistance = 1500;
    this.controls.minDistance = 0;

    // Set AmbientLight //
    this.ambient = new THREE.AmbientLight(0xFFFFFF);
    this.ambient.position.set(0, 0, 0);
    this.scene.add(this.ambient);

    // Skybox //
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    // const urls = [cright, cleft, ctop, cbottom, cfront, cback];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    this.skybox.mapping = THREE.CubeReflectionMapping; // CubeReflectionMapping || CubeRefractionMapping
    this.scene.background = this.skybox;

    // Create custom material for the shader
    this.metalMaterial = new THREE.MeshBasicMaterial({
      envMap: this.skybox,
    });


    this.effect = new THREE.AnaglyphEffect(this.renderer);
    this.effect.setSize(this.width, this.height);
    this.hitRnd();
  };

  hitRnd = () => {
    for(let i=0; i < 4; i++){
      const mx = 5 - Math.random() * 5;
      const my = 5 - Math.random() * 5;
      const mz = 5 - Math.random() * 5;
      this.makeParticle(mx, my, mz);
    }
  }

  makeParticle = (mx, my, mz) => {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(this.size, 18, 24, 0, Math.PI * 2, 0, Math.PI * 2),
      this.metalMaterial,
    );
    const point = new Particle({
      id: this.particles.length,
      size: this.size,
      x: mx,
      y: my,
      z: mz,
      box: this.box,
      settings: this.settings,
      ref: sphere
    });

    this.particles.push(point);
    this.scene.add(sphere);
  };

  checkParticles = () => {
    for (let i = 0; i < this.particles.length; i++) {
      const part = this.particles[i];
      this.particles[i].update();
      part.ref.position.set(part.vector.x, part.vector.y, part.vector.z);
    }
  };

  renderScene = () => {
    // this.renderer.render(this.scene, this.camera);
    this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    if (this.frames % 1 === 0) {
      this.checkParticles();
    }
    if(Math.random() * 255 > 253 && this.particles.length < 50) {
      this.hitRnd();
    }
    this.renderScene();
    this.frames ++;
    window.requestAnimationFrame(this.renderLoop);
  };
}
