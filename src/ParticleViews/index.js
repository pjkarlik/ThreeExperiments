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
    this.viewAngle = 55;
    this.aspect = this.width / this.height;
    this.near = 0.1;
    this.far = 20000;
    this.camPosition = {
      x: -1500.0,
      y: -90.0,
      z: -200.0
    };
    this.trsPosition = {
      x: -1500.0,
      y: -90.0,
      z: -200.0
    };
    // Particles Stuff //

    this.background = 0x333333;
    this.mirror = 0;
    this.amount = 30;
    this.particles = [];
    this.particleColor = 0xFFFFFF;
    this.emitter = {
      x: 0,
      y: 100,
      z: 0
    };
    this.box = {
      top: 3000,
      left: -3000,
      bottom: -500,
      right: 3000,
    };
    this.settings = {
      gravity: 0.9,
      bounce: 0.35,
    };
    this.camTimeoutx = true;
    this.camTimeouty = true;
    this.camTimeoutz = true;
    setTimeout(
      () => {
        this.camTimeoutx = false;
        this.camTimeouty = false;
        this.camTimeoutz = false;
      },
      3000 + (600 * Math.random() * 10)
    );
    window.addEventListener('resize', this.resize, true);
    this.setRender();
    this.setEffects();
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
      mirror: this.mirror,
      color: [0, 255, 51],
      light: [255, 255, 255],
      cube: [255, 255, 255]
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
    folderRender.add(this.options, 'mirror', 0, 4).step(1)
    .onFinishChange((value) => {
      this.effect.uniforms.side.value = value;
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
    folderRender.addColor(this.options, 'cube')
    .onChange((value) => {
      const hue = this.rgbToHex(~~(value[0]), ~~(value[1]), ~~(value[2]));
      this.particleColor = hue;
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
      color: this.particleColor
    }); 
  };

  setEffects = () => {
    this.effect = new THREE.AnaglyphEffect(this.renderer);
    this.effect.setSize(this.width, this.height);

    // let effect;
 
    // this.composer = new THREE.EffectComposer(this.renderer);
    // this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

    // this.effect = new THREE.ShaderPass(THREE.MirrorShader);
    // this.effect.uniforms.side.value = this.mirror;
    // this.composer.addPass(this.effect);

    // effect = new THREE.ShaderPass(THREE.RGBShiftShader);
    // effect.uniforms.amount.value = 0.001;
    // effect.uniforms.angle.value = 0.0;
    // effect.renderToScreen = true;
    // this.composer.addPass(effect);
  }

  hitRnd = () => {
    const { x, y, z } = this.emitter;
    const amount = Math.abs(Math.random() * 10);
    
    const amps = 125;
    // for (let i = 0; i < amount; i++) {
    this.frames++;
    const frame = this.frames * 3.6;
    // let amps = 40 + Math.abs(this.amps * Math.cos((this.frames * 0.2 ) * Math.PI / 180));
    const sVar = amps * Math.sin(frame *  Math.PI / 180);
    const cVar = amps * Math.cos(frame * Math.PI / 180);
    const dVar = amps * Math.cos((frame * 0.5) * Math.PI / 180);
    this.makeParticle(x + sVar, y + cVar, z + dVar);
    // }
  };

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
      vx: -(0.0 - mx) * 0.05,
      vy: -(0.0 - my) * 0.05,
      vz: 3.0,
      box: this.box,
      settings: this.settings,
      ref: sphere,
      decay: 0.00015
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
      part.ref.scale.x = 1.0 * part.size;
      part.ref.scale.y = 1.0 * part.size;
      part.ref.scale.z = 1.0 * part.size;
      part.ref.material.color.setHex(this.particleColor);
      if (part.life > 800 || part.size < 0.0) {
        this.scene.remove(part.ref);
        this.particles.splice(i, 1);
      }
    }
  };

  cameraLoop = () => {
    const damp = 0.01;
    this.camPosition.x = this.camPosition.x - (this.camPosition.x - this.trsPosition.x) * damp;
    this.camPosition.y = this.camPosition.y - (this.camPosition.y - this.trsPosition.y) * damp;
    this.camPosition.z = this.camPosition.z - (this.camPosition.z - this.trsPosition.z) * 0.004;

    this.camera.position.set(
      this.camPosition.x,
      this.camPosition.y,
      this.camPosition.z
    );
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    if(!this.camTimeoutx && Math.random() * 260 > 200) {
      const tempRand = 100 + Math.random() * 1000;
      this.trsPosition.x = Math.random() * 255 > 200 ?
        Math.random() * 250 > 100 ? -(tempRand) : tempRand : 0;
      this.camTimeoutx = true;
      setTimeout(
        () => { this.camTimeoutx = false; },
        6000 + (1000 * Math.random() * 20)
      );
    }
    if(!this.camTimeouty && Math.random() * 260 > 200) {
      const tempRand = 100 + Math.random() * 1000;
      this.trsPosition.y = Math.random() * 255 > 200 ?
        Math.random() * 250 > 100 ? tempRand : -(tempRand) : 0;
      this.camTimeouty = true;
      setTimeout(
        () => { this.camTimeouty = false; },
        6000 + (1000 * Math.random() * 20)
      );
    }
    if(!this.camTimeoutz && Math.random() * 255 > 253) {
      const tempRand = 300 + Math.random() * 300;
      this.trsPosition.z = Math.random() * 200 > 150 ? tempRand : -(tempRand);
      this.camTimeoutz = true;
      setTimeout(
        () => { this.camTimeoutz = false; },
        18000 + (1100 * Math.random() * 7)
      );
    }
  };

  renderScene = () => {
    // this.composer.render();
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
    this.cameraLoop();
    this.renderScene();
    window.requestAnimationFrame(this.renderLoop);
  };
}
