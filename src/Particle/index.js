import dat from 'dat-gui';
import THREE from '../Three';
import Particle from './Particle';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 360;
    this.size = 5;
    this.controls = undefined;
    this.scene = undefined;
    this.camera = undefined;
    this.render = undefined;
    this.skybox = undefined;
    // Camera Stuff and Viewport //
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspect = this.width / this.height;
    this.devicePixelRatio = window.devicePixelRatio;
    this.viewAngle = 85;
    this.aspect = this.width / this.height;
    this.near = 0.1;
    this.far = 20000;
    // Particles Stuff //
    this.amount = 30;
    this.particles = [];
    this.box = {
      top: 3000,
      left: -3000,
      bottom: -200,
      right: 3000,
    };
    this.settings = {
      gravity: 0.9,
      bounce: 0.35,
    };
    window.addEventListener('resize', this.resize, true);
    this.setRender();
    this.createGUI();
    this.renderLoop();
  }

  resize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };
  
  createGUI = () => {
    this.options = {
      gravity: this.settings.gravity * 100,
      bounce: this.settings.bounce * 100,
      color: [0, 255, 51],
      light: [255, 255, 255]
    };
    this.gui = new dat.GUI();
    const folderRender = this.gui.addFolder('Particle Options');
    folderRender.add(this.options, 'gravity', 0, 100).step(1)
      .onFinishChange((value) => {
        this.settings.gravity = value * 0.01;
      });
    folderRender.add(this.options, 'bounce', 0, 100).step(1)
      .onFinishChange((value) => {
        this.settings.bounce = value * 0.01;
      });
    folderRender.addColor(this.options, 'color')
      .onChange((value) => {
        const hue = this.rgbToHex(~~(value[0]), ~~(value[1]), ~~(value[2]));
        this.ambient.color.setHex(hue);
      });
    folderRender.addColor(this.options, 'light')
    .onChange((value) => {
      const hue = this.rgbToHex(~~(value[0]), ~~(value[1]), ~~(value[2]));
      this.pointLight.color.setHex(hue);
    });
  }

  rgbToHex = (r, g, b) => {
    const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return `0x${hex}`;
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

    this.camera.position.set(0, 250, 500);
    this.camera.lookAt(new THREE.Vector3(0, 50, 0));

    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxDistance = 2500;
    this.controls.minDistance = 0;

    // Set AmbientLight //
    this.pointLight = new THREE.PointLight(0xFFFFFF);
    this.pointLight.position.set(20, 350, 300);
    this.scene.add(this.pointLight);

    this.ambient = new THREE.AmbientLight(0x00FF33);
    this.ambient.position.set(-30, 300, -100);
    this.scene.add(this.ambient);

    this.basicMaterial = new THREE.MeshPhongMaterial({
      color: 0xFFFFFF,
      specular: 0x222222
    }); 
  };

  hitRnd = () => {
    const amount = Math.abs(Math.random() * 10);
    for (let i = 0; i < amount; i++) {
      this.makeParticle(0, 300, 0);
    }
  }

  makeParticle = (mx, my, mz) => {
    const sphere = new THREE.Mesh(
      new THREE.BoxBufferGeometry(this.size, this.size, this.size),
      this.basicMaterial,
    );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    const point = new Particle({
      size: this.size - Math.random() * 1,
      x: mx,
      y: my,
      z: mz,
      box: this.box,
      settings: this.settings,
      ref: sphere
    });
    sphere.position.set(mx, my, mz);
    this.particles.push(point);
    this.scene.add(sphere);
  };

  checkParticles = () => {
    for (let i = 0; i < this.particles.length; i++) {
      const part = this.particles[i];
      // part.settings = this.settings;
      part.update();
      part.ref.position.set(
        part.x, 
        part.y, 
        part.z
      );
      part.ref.scale.x = part.size;
      part.ref.scale.y = part.size;
      part.ref.scale.z = part.size;
      if (part.life > 800 || part.size < 0.0) {
        this.scene.remove(part.ref);
        this.particles.splice(i, 1);
      }
    }
  };

  renderScene = () => {
    this.renderer.render(this.scene, this.camera);
    // this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    if (this.frames % 1 === 0) {
      this.checkParticles();
    }
    if(Math.random() * 200 > 100 && this.particles.length < 500) {
      this.hitRnd();
    }
    this.renderScene();
    this.frames ++;
    window.requestAnimationFrame(this.renderLoop);
  };
}
