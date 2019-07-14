import dat from 'dat.gui';
import THREE from '../ThreeLight';
import Particle from './Particle-alt';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 360;
    this.size = 5;
    this.speed = 5.0;

    // Camera Stuff and Viewport //
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspect = this.width / this.height;
    this.devicePixelRatio = window.devicePixelRatio;
    this.viewAngle = 85;
    this.aspect = this.width / this.height;
    this.near = 0.1;
    this.far = 30000;
    // Particles Stuff //

    this.particles = [];
    this.particleColor = 360;
    this.background = 0x333333;
    this.camPosition = {
      x: -1546.7881,
      y: -93.118,
      z: -341.03976
    };
    this.trsPosition = {
      x: -1546.7881,
      y: -93.118,
      z: -341.03976
    };
    this.emitter = {
      x: 0,
      y: 0,
      z: -1200
    };
    this.box = {
      top: 4000,
      left: -4000,
      bottom: -4000,
      right: 4000,
    };
    this.settings = {
      gravity: 0.0,
      bounce: 0.0,
    };
    this.threshold = 0.3;
    this.strength = 1.2;
    this.radius = 0.45;
    this.camTimeoutx = true;
    this.camTimeouty = true;
    this.camTimeoutz = true;
    setTimeout(
      () => {
        this.canSpeed = true;
        this.camTimeoutx = false;
        this.camTimeouty = false;
        this.camTimeoutz = false;
      },
      3000 + (600 * Math.random() * 10)
    );
    window.addEventListener('resize', this.resize, true);
    this.setRender();
    this.setEffects();
    // this.createGUI();
    this.renderLoop();
    // this.music();
  }

  resize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };
  
  createGUI = () => {
  }

  setRender = () => {
    // Set Render and Scene //
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);
    
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(this.background, 0.00075);
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
    pointLight.position.set(50, 450, -800);
    this.scene.add(pointLight);
    pointLight = new THREE.PointLight(0xEEEEEE);
    pointLight.position.set(-50, -450, 800);
    this.scene.add(pointLight);
    let ambient = new THREE.AmbientLight(0x9f9f9f);
    ambient.position.set(1, 450, -400);
    this.scene.add(ambient);
  };

  music = () => {
    const youtube = document.createElement('iframe');
    youtube.width=1;
    youtube.height=1;
    youtube.wmode='transparent';
    const html ='https://www.youtube.com/embed/gkyFQTUR-rA?rel=0&autoplay=1';
    youtube.src = encodeURI(html); // 'data:text/html;charset=utf-8,' + // e4GJsV3PzsI // gkyFQTUR-rA
    youtube.frameborder=0;
    document.body.appendChild(youtube);
    
  }

  setEffects = () => {
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

    this.bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.strength, this.radius, 1.0 - this.threshold
    );

    this.composer.addPass(this.bloomPass);

    const copyEffect = new THREE.ShaderPass(THREE.CopyShader);
    copyEffect.renderToScreen = true;
    this.composer.addPass(copyEffect);
  }
  
  rgbToHex = (r, g, b) => {
    const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return `0x${hex}`;
  };
  
  hitRnd = () => {
    const { x, y, z } = this.emitter;
    this.frames++;
    const type = Math.random() * 100 > 94;

    let size = Math.random() * 100 > 50 ? 1 + Math.random() * 6 : 1;
    let amps = type ? 280 : 80 + Math.abs(200 * Math.cos((this.frames * 0.25 ) * Math.PI / 180));
    let sVar = amps * Math.sin(this.frames * 2.0 * Math.PI / 180);
    let cVar = amps * Math.cos(this.frames * 2.0 * Math.PI / 180);

    this.makeParticle(x + sVar, y + cVar, z, type, size);
    this.makeParticle(x - sVar, y + cVar, z, type, size);

    this.makeParticle(x + sVar, y - cVar, z, type, size);
    this.makeParticle(x - sVar, y - cVar, z, type, size);

    if(type){
      const offsetZ = 900;

      amps = 30 + Math.cos((this.frames * 0.25 ) * Math.PI / 180) * 1100;

      const dVar = 300 * Math.sin(amps * 0.5 * Math.PI / 180);
      sVar = amps * Math.sin(this.frames * 3.0 * Math.PI / 180);
      cVar = amps * Math.cos(this.frames * 2.0 * Math.PI / 180);
    
      this.makeParticle(x + sVar, y + cVar * 2, z - offsetZ, true, size);
      this.makeParticle(x - sVar, y - cVar * 2, z - offsetZ, true, size);
      this.makeParticle(x + sVar + dVar, y + cVar - dVar, z - offsetZ, true, size);
      this.makeParticle(x - sVar - dVar, y - cVar + dVar, z - offsetZ, true, size);
    }
  }

  makeParticle = (mx, my, mz, type, size) => {

    const geometry = type ?
      new THREE.SphereGeometry((2 + this.size) * 5, 6, 6, 0, Math.PI * 2, 0, Math.PI * 2) :
      new THREE.BoxGeometry(this.size, this.size, this.size * size);
    const sphere = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial(
        { color:0xFFFFFF, wireframe: type }
      )
    );
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    const point = new Particle({
      size,
      x: mx,
      y: my,
      z: mz,
      vx: type ? -(0.0 - mx) * 0.02 : -0.00001, // -(0.0 - mx) * 0.01,
      vy: type ? -(0.0 - my) * 0.02 : -0.00001, //  -(0.0 - my) * 0.01,
      vz: type ? this.speed * 2 : this.speed,
      box: this.box,
      settings: this.settings,
      ref: sphere
    });

    sphere.position.set(mx, my, mz);
    // const timez = this.frames * 0.1;
    // const particleColor = Math.abs(0.5 * Math.sin(this.frames * 0.35 * Math.PI / 180) * 0.75);

    // const cRed = type ? particleColor : Math.sin(particleColor * 10.0 - 6.0 * Math.PI / 180);
    // const cGreen = type ? particleColor : 0;
    // const cBlue = type ? particleColor : 0;

    // sphere.material.color.setRGB(cRed, cGreen ,cBlue);

    const particleColor = Math.abs(0.75 * Math.sin(this.frames * 0.25 * Math.PI / 180) * 0.75);
    // sphere.material.color.setRGB(particleColor, particleColor ,particleColor);
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
        part.ref.geometry.dispose();
        part.ref.material.dispose();
        this.scene.remove(part.ref);
        part.ref = undefined;
        this.particles.splice(i, 1);
      }
    }
  };

  cameraLoop = () => {
    const damp = 0.01;
    this.camPosition.x = this.camPosition.x - (this.camPosition.x - this.trsPosition.x) * damp;
    this.camPosition.y = this.camPosition.y - (this.camPosition.y - this.trsPosition.y) * damp;
    this.camPosition.z = this.camPosition.z - (this.camPosition.z - this.trsPosition.z) * damp;

    this.camera.position.set(
      this.camPosition.x,
      this.camPosition.y,
      this.camPosition.z
    );
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    if(!this.camTimeoutx && Math.random() * 260 > 200) {
      const tempRand = 500 + Math.random() * 1500;
      this.trsPosition.x = Math.random() * 255 > 200 ?
        Math.random() * 200 > 100 ? -(tempRand) : tempRand : 0;
      this.camTimeoutx = true;
      setTimeout(
        () => { this.camTimeoutx = false; },
        6000 + (1000 * Math.random() * 20)
      );
    }
    if(!this.camTimeouty && Math.random() * 260 > 200) {
      const tempRand = 500 + Math.random() * 1500;
      this.trsPosition.y = Math.random() * 255 > 200 ?
        Math.random() * 200 > 100 ? tempRand : -(tempRand) : 0;
      this.camTimeouty = true;
      setTimeout(
        () => { this.camTimeouty = false; },
        6000 + (1000 * Math.random() * 20)
      );
    }
    if(!this.camTimeoutz && Math.random() * 255 > 253) {
      this.trsPosition.z = Math.random() * 200 > 100 ? 50 : -1100 + Math.random() * 700;
      this.camTimeoutz = true;
      setTimeout(
        () => { this.camTimeoutz = false; },
        8000 + (1000 * Math.random() * 25)
      );
    }
  };

  renderScene = () => {
    this.composer.render();
    // this.renderer.render(this.scene, this.camera);
    // this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.checkParticles();

    if(Math.random() * 255 > 230){
      this.speed = 5.0 + Math.random() * 35;
    }
    
    if(this.particles.length < 1200 && this.frames % 1 == 0) {
      this.hitRnd();
    }

    this.cameraLoop();
    this.renderScene();
    this.frames ++;
    window.requestAnimationFrame(this.renderLoop);
  };
}
