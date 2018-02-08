require('../shader/BWShiftFragment');
import dat from 'dat-gui';
import THREE from '../Three';
import Particle from './Particle-alt';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 360;
    this.size = 5;
    this.speed = 5.0;

    this.scale = 1.0;
    this.ratio = 1024;
    this.mirror = 4;
    
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
    this.background = 0x999999;
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

    const renderPass = new THREE.RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.effect = new THREE.ShaderPass(THREE.MirrorShader);
    this.effect.uniforms.side.value = this.mirror;

    this.composer.addPass(this.effect);

    this.rfrag = new THREE.ShaderPass(THREE.RenderFragment);
    this.rfrag.uniforms.scale.value = this.scale;
    this.rfrag.uniforms.ratio.value = this.ratio;
    this.rfrag.uniforms.time.value = this.frames;
    this.rfrag.renderToScreen = true;
    this.composer.addPass(this.rfrag);
  };
  
  hitRnd = () => {
    const { x, y, z } = this.emitter;
    this.frames++;
    let iter = 3.0;
    let amps = 400 * Math.cos((this.frames * 0.2 ) * Math.PI / 180);
    let sVar = amps * Math.sin(this.frames * iter * Math.PI / 180);
    let cVar = amps * Math.cos(this.frames * iter * Math.PI / 180);
    let dVar = amps * Math.cos((this.frames * 0.4 ) * 4 * Math.PI / 180);
    this.makeParticle(x + sVar, y + cVar, z + dVar);
  };

  makeParticle = (mx, my, mz) => {

    const geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
    const sphere = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial(
        { color: 0xFFFFFF, 
          // specular: 0xFFFFFF, 
          wireframe: false 
        }
      )
    );
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    const point = new Particle({
      size: this.size,
      x: mx,
      y: my,
      z: mz,
      vx: -0.00001, // -(0.0 - mx) * 0.01,
      vy: -0.00001, //  -(0.0 - my) * 0.01,
      vz: this.speed,
      box: this.box,
      settings: this.settings,
      ref: sphere, 
      decay: 0.00001
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
      part.ref.rotateX((part.x * 0.01) * Math.PI/180);
      part.ref.rotateY((part.y * 0.01) * Math.PI/180);
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

    if(!this.camTimeoutx && Math.random() * 260 > 200) {
      const tempRand = 200 + Math.random() * 900;
      this.trsPosition.x = Math.random() * 255 > 200 ?
        Math.random() * 200 > 100 ? -(tempRand) : tempRand : 0;
      this.camTimeoutx = true;
      setTimeout(
        () => { this.camTimeoutx = false; },
        6000 + (1000 * Math.random() * 20)
      );
    }
    if(!this.camTimeouty && Math.random() * 260 > 200) {
      const tempRand = 200 + Math.random() * 900;
      this.trsPosition.y = Math.random() * 255 > 200 ?
        Math.random() * 200 > 100 ? tempRand : -(tempRand) : 0;
      this.camTimeouty = true;
      setTimeout(
        () => { this.camTimeouty = false; },
        6000 + (1000 * Math.random() * 20)
      );
    }
    if(!this.camTimeoutz && Math.random() * 255 > 252) {
      this.trsPosition.z = Math.random() * 200 > 100 ? 10 : -(200 + Math.random() * 300);
      this.camTimeoutz = true;
      setTimeout(
        () => { this.camTimeoutz = false; },
        9000 + (1500 * Math.random() * 25)
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

    // if(Math.random() * 255 > 230){
    //   this.speed = 5.0 + Math.random() * 35;
    // }
    
    if(this.particles.length < 1200 && this.frames % 1 == 0) {
      this.hitRnd();
    }
    
    this.cameraLoop();
    this.renderScene();
    this.frames++;
    this.rfrag.uniforms.time.value = this.frames;

    window.requestAnimationFrame(this.renderLoop);
  };
}
