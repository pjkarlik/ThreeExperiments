// require('../shader/CubicFragment');

import dat from 'dat-gui';
import THREE from '../ThreeLight';
import Particle from './Particle-alt';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.size = 9;
    this.speed = 6.0;
    this.canSpeed = false;
    this.canFlip = false;
    this.camView= false;
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
    this.scale = 145.0;
    this.ratio = 1024;
    this.mirror = 4;
    this.particles = [];
    this.particleColor = 360;
    this.background = 0x030030;
    this.emitter = {
      x: 0,
      y: 0,
      z: -1100
    };
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
    this.box = {
      top: 6000,
      left: -6000,
      bottom: -6000,
      right: 6000,
    };
    this.settings = {
      gravity: 0.0,
      bounce: 0.0,
    };
    window.addEventListener('resize', this.resize, true);
    window.addEventListener('click', () => {
      console.log(this.camera.position);
    }, true);
    this.setRender();
    // this.setEffects();
    // this.createGUI();
    this.renderLoop();

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
      3000 + Math.random() * 2000
    );
  }

  resize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  createGUI = () => {
    // this.options = {
    //   gravity: this.settings.gravity * 100,
    //   bounce: this.settings.bounce * 100
    // };
    // this.gui = new dat.GUI();
    // const folderRender = this.gui.addFolder('Particle Options');
    // folderRender.add(this.options, 'gravity', 0, 100).step(1)
    //   .onFinishChange((value) => {
    //     this.settings.gravity = value * 0.01;
    //   });
    // folderRender.add(this.options, 'bounce', 0, 100).step(1)
    //   .onFinishChange((value) => {
    //     this.settings.bounce = value * 0.01;
    //   });
  }

  setRender = () => {
    // Set Render and Scene //
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(this.background, 0.00065);
    this.scene.background = new THREE.Color(this.background);

    this.camera = new THREE.PerspectiveCamera(
        this.viewAngle,
        this.aspect,
        this.near,
        this.far
    );
    this.camera.position.set(-1546.7881, -93.118, -341.03976);
    //this.camera.position.set(0, 0, -1000);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Set Lights //
    let pointLight = new THREE.PointLight(0xAAAAAA);
    pointLight.position.set(50, 450, -900);
    this.scene.add(pointLight);
    pointLight = new THREE.PointLight(0xAAAAAA);
    pointLight.position.set(-50, -450, 1000);
    this.scene.add(pointLight);
    let ambient = new THREE.AmbientLight(0x999999);
    ambient.position.set(1, -450, -50);
    this.scene.add(ambient);
  };

  setEffects = () => {
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

    const renderPass = new THREE.RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.effect = new THREE.ShaderPass(THREE.MirrorShader);
    this.effect.uniforms.side.value = this.mirror;

    this.composer.addPass(this.effect);

    this.rfrag = new THREE.ShaderPass(THREE.RenderFragment);
    this.rfrag.uniforms.scale.value = this.scale;
    this.rfrag.uniforms.ratio.value = this.ratio;
    this.rfrag.renderToScreen = true;
    this.composer.addPass(this.rfrag);
  };

  distance = (x1, y1, x2, y2) => {
    const distance = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    return distance;
  };

  hitRnd = () => {
    const { x, y, z } = this.emitter;
    this.frames++;

    const type = Math.random() * 100 > 94;
    let size = 12; // 10 + Math.random() * 10;
    let amps = 600 * Math.cos((this.frames * 0.35 ) * Math.PI / 180);
    
    let dVar = 300 * Math.sin(amps * 1.5 * Math.PI / 180);
    let sVar = amps * Math.sin(this.frames * 3.0 * Math.PI / 180);
    let cVar = amps * Math.cos(this.frames * 2.0 * Math.PI / 180);
  
    this.makeParticle(x + sVar, y + cVar * 2, z, false, size);
    this.makeParticle(x - sVar, y - cVar * 2, z, false, size);
    this.makeParticle(x + sVar + dVar, y + cVar - dVar, z, false, size);
    this.makeParticle(x - sVar - dVar, y - cVar + dVar, z, false, size);

    if(type){
      const offsetZ = 900;
      size = 25 + Math.random() * 15;
      amps = 30 + Math.cos((this.frames * 0.25 ) * Math.PI / 180) * 1100;

      dVar = 300 * Math.sin(amps * 0.5 * Math.PI / 180);
      sVar = amps * Math.sin(this.frames * 3.0 * Math.PI / 180);
      cVar = amps * Math.cos(this.frames * 2.0 * Math.PI / 180);
    
      this.makeParticle(x + sVar, y + cVar * 2, z - offsetZ, true, size);
      this.makeParticle(x - sVar, y - cVar * 2, z - offsetZ, true, size);
      this.makeParticle(x + sVar + dVar, y + cVar - dVar, z - offsetZ, true, size);
      this.makeParticle(x - sVar - dVar, y - cVar + dVar, z - offsetZ, true, size);
    }
  }

  makeParticle = (mx, my, mz, type, size) => {
    const geometry = new THREE.BoxBufferGeometry(size, size, size);
    const sphere = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial(
        { color:0xFFFFFF, wireframe: false }
      )
    );
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    const point = new Particle({
      size,
      x: mx,
      y: my,
      z: mz,
      vx: type ? 0.01 : 0.001, // -(0.0 - mx) * 0.01,
      vy: type ? 0.01 : 0.001, //  -(0.0 - my) * 0.01,
      vz: this.speed * 8,
      box: this.box,
      settings: this.settings,
      ref: sphere
    });
    if(type){
      sphere.rotateX(mx * Math.PI / 180); 
      sphere.rotateY(my * Math.PI / 180); 
    } else {
      sphere.rotateX(-(mx * 0.1) * Math.PI / 180); 
      sphere.rotateY(-(my * 0.1) * Math.PI / 180); 
    }
    sphere.position.set(mx, my, mz);

    const timez = this.frames * 0.1;
    const particleColor = Math.abs(0.5 * Math.sin(this.frames * 0.35 * Math.PI / 180) * 0.75);

    const cRed = type ? particleColor : Math.sin(particleColor * 10.0 - 6.0);
    const cGreen = type ? particleColor : Math.sin(particleColor * 8.0 - 5.0);
    const cBlue = type ? particleColor : Math.cos(particleColor * 8.0 - 4.0);

    sphere.material.color.setRGB(cRed, cGreen ,cBlue);

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

      part.ref.scale.x = part.size * 0.2;
      part.ref.scale.y = part.size * 0.2;
      part.ref.scale.z = part.size * 0.2;
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
    this.camPosition.z = this.camPosition.z - (this.camPosition.z - this.trsPosition.z) * damp;

    this.camera.position.set(
      this.camPosition.x,
      this.camPosition.y,
      this.camPosition.z
    );
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    if(!this.camTimeoutx && Math.random() * 255 > 200) {
      const tempRand = 700 + Math.random() * 2200;
      this.trsPosition.x = Math.random() * 255 > 200 ?
        Math.random() * 200 > 100 ? -(tempRand) : tempRand : 0;
      this.camTimeoutx = true;
      setTimeout(
        () => { this.camTimeoutx = false; },
        3000 + Math.random() * 6000
      );
    }
    if(!this.camTimeouty && Math.random() * 255 > 200) {
      const tempRand = 800 + Math.random() * 2200;
      this.trsPosition.y = Math.random() * 255 > 230 ?
        Math.random() * 200 > 100 ? tempRand : -(tempRand) : 0;
      this.camTimeouty = true;
      setTimeout(
        () => { this.camTimeouty = false; },
        3000 + Math.random() * 4000
      );
    }
    if(!this.camTimeoutz && Math.random() * 255 > 254) {
      this.trsPosition.z = Math.random() * 200 > 100 ? 50 : -1100 + Math.random() * 700;
      this.camTimeoutz = true;
      setTimeout(
        () => { this.camTimeoutz = false; },
        8000 + Math.random() * 8000
      );
    }
  };

  renderScene = () => {
    // this.composer.render();
    this.renderer.render(this.scene, this.camera);
    // this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.checkParticles();

    // if(Math.random() * 255 > 230 && this.canSpeed){
    //   this.canSpeed = false;
    //   //this.speed = 3.0 + Math.random() * 5;
    //   setTimeout(() => {
    //     this.canSpeed = true;
    //   }, 100 + Math.random() * 1000);
    // }

    if(this.particles.length < 1000 && this.frames % 3 == 0) {
      this.hitRnd();
    }
    if(this.trsPosition.x == 0 && this.trsPosition.y == 0) {
      const zd = (Math.sin(this.frames * 0.003 * Math.PI / 180));
      this.camera.rotateZ(zd * Math.PI / 180);
    }
    this.renderScene();
    this.cameraLoop();
    this.frames ++;
    window.requestAnimationFrame(this.renderLoop);
  };
}
