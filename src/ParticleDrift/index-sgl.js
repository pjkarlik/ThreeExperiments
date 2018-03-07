require('../shader/OscFragment');

import dat from 'dat-gui';
import THREE from '../ThreeLight';
import Particle from './Particle-alt';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 360;
    this.size = 5;
    this.speed = 5.0;
    this.amps = 500;
    this.scale = 1.0;
    this.ratio = 1024;
    this.angle = 255.0;
    this.dec = 26.0;
    this.mirror = 4;

    // Camera Stuff and Viewport //
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspect = this.width / this.height;
    this.devicePixelRatio = window.devicePixelRatio;
    this.viewAngle = 45;
    this.aspect = this.width / this.height;
    this.near = 1;
    this.far = 20000;
    // Particles Stuff //

    this.particles = [];
    this.particleColor = 360;
    this.background = 0x333333;
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
    this.emitter = {
      x: 0,
      y: 0,
      z: -1200
    };
    const bsize = 6000;
    this.box = {
      top: bsize,
      left: -bsize,
      bottom: -bsize,
      right: bsize,
    };
    this.settings = {
      gravity: 0.0,
      bounce: 0.35,
    };
    this.threshold = 0.6;
    this.strength = 1.7;
    this.radius = 0.65;
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
    window.addEventListener('click', () => {
      console.log(this.camera.position);
    }, true);
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
    this.options = {
      gravity: this.settings.gravity * 100,
      bounce: this.settings.bounce * 100,
      amps: this.amps
    };
    this.gui = new dat.GUI();
    const folderRender = this.gui.addFolder('Particle Options');
    // folderRender.add(this.options, 'gravity', 0, 100).step(1)
    //   .onFinishChange((value) => {
    //     this.settings.gravity = value * 0.01;
    //   });
    // folderRender.add(this.options, 'bounce', 0, 100).step(1)
    //   .onFinishChange((value) => {
    //     this.settings.bounce = value * 0.01;
    //   });
    folderRender.add(this.options, 'amps', 0, 800).step(1)
    .onFinishChange((value) => {
      this.amps = value;
    });
  }

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
    pointLight.position.set(-250, -850, 800);
    this.scene.add(pointLight);
    let ambient = new THREE.AmbientLight(0x9f9f9f);
    ambient.position.set(1, 200, -200);
    this.scene.add(ambient);
  };

  music = () => {
    const youtube = document.createElement('iframe');
    youtube.width=1;
    youtube.height=1;
    const videoid = '3vnZnuqgh7U';
    youtube.wmode='transparent';
    const html ='https://www.youtube.com/embed/n6tVkGsaE94?rel=0&autoplay=1';
    youtube.src = encodeURI(html); // 'data:text/html;charset=utf-8,' + // e4GJsV3PzsI // gkyFQTUR-rA
    youtube.frameborder=0;
    document.body.appendChild(youtube);
    const overlay = document.createElement('div');
    const link = document.createElement('a');
    const image = document.createElement('img');
    image.src = 'https://img.youtube.com/vi/n6tVkGsaE94/sddefault.jpg';
    image.width = 60;
    image.height = 45;
    image.style.float = 'left';
    image.style.margin = '0 0 0 15px';
    link.href = html;
    link.innerHTML = 'Music by Lorn | Shelter';
    overlay.style.position = 'absolute';
    overlay.style.bottom = '15px';
    overlay.style.left = '0';
    overlay.style.lineHeight = '45px';
    overlay.style.zIndex = '9999';
    link.style.color = '#FFF';
    link.style.padding = '15px';
    overlay.appendChild(image);
    overlay.appendChild(link);
    document.body.appendChild(overlay);
  }

  setEffects = () => {
    // this.effect = new THREE.AnaglyphEffect(this.renderer);
    // this.effect.setSize(this.width, this.height);
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

    const renderPass = new THREE.RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
     this.strength, this.radius, 1.0 - this.threshold
    );
    this.composer.addPass(this.bloomPass);

    // const copyEffect = new THREE.ShaderPass(THREE.CopyShader);
    // copyEffect.renderToScreen = true;
    // this.composer.addPass(copyEffect);
    this.rfrag = new THREE.ShaderPass(THREE.RenderFragment);
    // this.rfrag.uniforms.scale.value = this.scale;
    // this.rfrag.uniforms.ratio.value = this.ratio;
    // this.rfrag.uniforms.time.value = this.frames;
    this.rfrag.renderToScreen = true;
    this.composer.addPass(this.rfrag);
  };

  hitRnd = () => {
    const { x, y, z } = this.emitter;
    this.frames++;
    let iter = 2.0;
    let amps = 40 + Math.abs(this.amps * Math.cos((this.frames * 0.2 ) * Math.PI / 180));
    let sVar = amps * Math.sin(this.frames * iter * Math.PI / 180);
    let cVar = amps * Math.cos(this.frames * iter * Math.PI / 180);
    let dVar = amps * Math.cos((this.frames * 0.4 ) * 8 * Math.PI / 180);
    this.makeParticle(x + sVar, y + cVar, z + dVar);
    this.makeParticle(x - sVar, y - cVar, z + dVar);
  };

  makeParticle = (mx, my, mz) => {
    const geometry = new THREE.BoxBufferGeometry(this.size / 2, this.size  * 3, this.size * 8);
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
      vx: -(0.0 - mx) * 0.005,
      vy: -(0.0 - my) * 0.005,
      vz: this.speed,
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
    // const particleColor = Math.abs(Math.sin(this.frames * 0.25 * Math.PI / 180) * 0.75);
    const offsetColor  = 0.85 - Math.abs(Math.cos(this.frames * 0.25 * Math.PI / 180) );
    sphere.material.color.setRGB(offsetColor, offsetColor, offsetColor);
    // sphere.material.color.setHSL(particleColor,1,0.5);

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
    this.camPosition.z = this.camPosition.z - (this.camPosition.z - this.trsPosition.z) * 0.004;

    this.camera.position.set(
      this.camPosition.x,
      this.camPosition.y,
      this.camPosition.z
    );
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    if(!this.camTimeoutx && Math.random() * 260 > 250) {
      const tempRand = 100 + Math.random() * 1000;
      this.trsPosition.x = Math.random() * 255 > 200 ?
        Math.random() * 250 > 100 ? -(tempRand) : tempRand : 0;
      this.camTimeoutx = true;
      setTimeout(
        () => { this.camTimeoutx = false; },
        6000 + (1000 * Math.random() * 20)
      );
    }
    if(!this.camTimeouty && Math.random() * 260 > 240) {
      const tempRand = 100 + Math.random() * 1000;
      this.trsPosition.y = Math.random() * 255 > 170 ?
        Math.random() * 250 > 100 ? tempRand : -(tempRand) : 0;
      this.camTimeouty = true;
      setTimeout(
        () => { this.camTimeouty = false; },
        6000 + (1000 * Math.random() * 20)
      );
    }
    if(!this.camTimeoutz && Math.random() * 255 > 253) {
      this.trsPosition.z = Math.random() * 200 > 150 ? 100 + Math.random() * 100 : -(100 + Math.random() * 100);
      this.camTimeoutz = true;
      setTimeout(
        () => { this.camTimeoutz = false; },
        18000 + (1100 * Math.random() * 7)
      );
    }
    if (this.camPosition.x == 0 && this.camPosition.y == 0 ) {
      this.camera.rotationZ((this.frames * 0.1) * Math.PI / 180);
    }
  };

  dist = (a, b, c, d) =>{
    return Math.sqrt(((a - c) * (a - c) + (b - d) * (b - d)));
  }
  renderScene = () => {
    this.composer.render();
    // this.renderer.render(this.scene, this.camera);
    // this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.checkParticles();

    if(Math.random() * 255 > 245){
      this.speed = 5.0 + Math.random() * 10;
    }

    if(this.particles.length < 1800 && this.frames % 3 == 0) {
      this.hitRnd();
    }

    this.cameraLoop();
    this.renderScene();
    this.frames++;
    this.rfrag.uniforms.time.value = this.frames * 0.01;
    window.requestAnimationFrame(this.renderLoop);
  };
}