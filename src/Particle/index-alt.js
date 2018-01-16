import dat from 'dat-gui';
import THREE from '../Three';
import Particle from './Particle-alt';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 360;
    this.size = 5;
    this.speed = 5.0;
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
    this.particleColor = 360;
    this.emitter = {
      x: 0,
      y: 0,
      z: -600
    };
    this.box = {
      top: 5000,
      left: -5000,
      bottom: -400,
      right: 5000,
    };
    this.settings = {
      gravity: 0.0,
      bounce: 0.45,
    };
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
      color: [0, 255, 51],
      light: [255, 255, 255],
      speed: this.speed
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
    folderRender.add(this.options, 'speed', 0, 50).step(1)
    .onFinishChange((value) => {
      this.speed = value;
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

    this.camera.position.set(0, 0, -800);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxDistance = 2500;
    this.controls.minDistance = 0;

    // Set AmbientLight //
    let pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.set(20, 350, 300);
    this.scene.add(pointLight);
    pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.set(-20, -350, 700);
    this.scene.add(pointLight);

    this.ambient = new THREE.AmbientLight(0x00FF33);
    this.ambient.position.set(-30, 300, -200);
    this.scene.add(this.ambient);
  };

  setEffects = () => {
    // this.effect = new THREE.AnaglyphEffect(this.renderer);
    // this.effect.setSize(this.width, this.height);
    // let effect;
 
    // this.composer = new THREE.EffectComposer(this.renderer);
    // this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

    // effect = new THREE.ShaderPass(THREE.MirrorShader);
    // effect.uniforms.side.value = 4;
    // this.composer.addPass(effect);

    // effect = new THREE.ShaderPass(THREE.RGBShiftShader);
    // effect.uniforms.amount.value = 0.001;
    // effect.uniforms.angle.value = 0.0;
    // effect.renderToScreen = true;
    // this.composer.addPass(effect);
  }
  
  hitRnd = () => {
    const { x, y, z } = this.emitter;
    const amps = 50 + Math.abs(200 * Math.cos((this.frames * 0.5 ) * Math.PI / 180));
    this.frames++;
    const sVar = amps * Math.sin(this.frames * 2.0 * Math.PI / 180);
    const cVar = amps * Math.cos(this.frames * 2.0 * Math.PI / 180);
    this.makeParticle(x + sVar, y + cVar, z);
    this.makeParticle(x - sVar, y + cVar, z);

    this.makeParticle(x + sVar, y - cVar, z);
    this.makeParticle(x - sVar, y - cVar, z);
  }

  makeParticle = (mx, my, mz) => {
    const particleColor = Math.sin(this.frames * 2.0 * Math.PI / 180) * 0.15;

    const sphere = new THREE.Mesh(
      new THREE.BoxBufferGeometry(this.size, this.size, this.size),
      new THREE.MeshPhongMaterial(
        { color: new THREE.Color(`hsl(${this.particleColor}, 100%, 50%)`) }
      )
    );
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    const point = new Particle({
      size: this.size - Math.random() * 1,
      x: mx,
      y: my,
      z: mz,
      vx: 0.01,
      vy: 0.01,
      vz: this.speed,
      box: this.box,
      settings: this.settings,
      ref: sphere
    });
    sphere.position.set(mx, my, mz);
    
    sphere.material.color.setHSL(particleColor,1,0.5);

    this.particles.push(point);
    this.scene.add(sphere);
  };

  checkParticles = () => {
    for (let i = 0; i < this.particles.length; i++) {
      const part = this.particles[i];
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
    // this.composer.render();
    this.renderer.render(this.scene, this.camera);
    // this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    if (this.frames % 1 === 0) {
      this.checkParticles();
    }
    if(Math.random() * 200 > 100 && this.particles.length < 800) {
      this.hitRnd();
    }
    if(Math.random() * 255 > 200){
      this.speed = 1.0 + Math.random() * 50;
    }
    this.renderScene();
    this.frames ++;
    window.requestAnimationFrame(this.renderLoop);
  };
}
