import dat from 'dat-gui';
import THREE from '../Three';
import Particle from './Particle';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 360;
    this.size = 3;
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
    this.viewAngle = 35;
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
      gravity: 0.0,
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
    this.scene.fog = new THREE.FogExp2(this.background, 0.0006);
    this.scene.background = new THREE.Color(this.background);

    this.camera = new THREE.PerspectiveCamera(
        this.viewAngle,
        this.aspect,
        this.near,
        this.far
    );

    this.camera.position.set(0, 0, 1200);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxDistance = 2500;
    this.controls.minDistance = 0;

    // Set Lights //
    let pointLight = new THREE.PointLight(0xDDDDDD);
    pointLight.position.set(450, 450, -800);
    this.scene.add(pointLight);
    pointLight = new THREE.PointLight(0xEEEEEE);
    pointLight.position.set(-150, -850, 800);
    this.scene.add(pointLight);
    let ambient = new THREE.AmbientLight(0x9f9f9f);
    ambient.position.set(800, 850, -150);
    this.scene.add(ambient);
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
    // const amount = Math.abs(Math.random() * 10);
    const iter = 2;
    const amps = 225;
    const amps2 = amps *2;
    // for (let i = 0; i < amount; i++) {
    this.frames++;
    const frame = this.frames;
    const gVar = amps2 * Math.sin((frame * 0.4) * iter * Math.PI / 180);
    const fVar = amps2 * Math.cos((frame * 0.3) * iter * Math.PI / 180);

    const sVar = amps * Math.sin(frame * iter * Math.PI / 180);
    const cVar = gVar * Math.cos(frame * iter * Math.PI / 180);
    const dVar = amps * Math.cos((frame * 0.5) * Math.PI / 180);

    
    this.makeParticle(x + sVar, y + cVar, z + dVar + (fVar * 0.6));
    this.makeParticle(x + cVar, y + fVar, z + gVar + (sVar * 0.6));
    // }
  };

  makeParticle = (mx, my, mz) => {
    const geometry = new THREE.BoxBufferGeometry(this.size, this.size, this.size);
    const sphere = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial({ color: 0xFFFFFF, specular: 0x999999 })
    );
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    const point = new Particle({
      size: this.size,
      x: mx,
      y: my,
      z: mz,
      vx: 0.0001, // -(0.0 - mx) * 0.015,
      vy: 0.0001, // -(0.0 - my) * 0.015,
      vz: 4.5,
      box: this.box,
      settings: this.settings,
      ref: sphere,
      decay: 0.000015
    });

    sphere.position.set(mx, my, mz);
    sphere.scale.x = this.size;
    sphere.scale.y = this.size;
    sphere.scale.z = this.size;
    const ex = this.emitter.x;
    const ey = this.emitter.y;
    const ry = Math.atan2(my - ey, mx - ex) * Math.PI / 180;

    sphere.rotateZ((15 + ry) * 180 / Math.PI);
    
    // const cRed = Math.sin(this.frames * 0.25 * Math.PI / 180);
    // const cGreen = Math.cos(this.frames * 0.25 * Math.PI / 180);
    // const cBlue = 0.9 - Math.sin(this.frames * 0.25 * Math.PI / 180);
    // sphere.material.color.setRGB(cRed, cGreen ,cBlue);
    // const offsetColor  = 0.85 - Math.abs(Math.cos(this.frames * 0.25 * Math.PI / 180) );
    // sphere.material.color.setRGB(offsetColor, offsetColor, offsetColor);
    const particleColor = Math.abs(Math.sin(this.frames * 0.25 * Math.PI / 180) * 0.75);
    sphere.material.color.setHSL(particleColor,1,0.5);

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
    this.frames ++;

    if (this.frames % 1 === 0) {
      this.checkParticles();
    }
    if(this.frames % 2 === 0 && this.particles.length < 1800) {
      this.hitRnd();
    }
    this.cameraLoop();
    this.renderScene();
    window.requestAnimationFrame(this.renderLoop);
  };
}
