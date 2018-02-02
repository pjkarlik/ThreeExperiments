import dat from 'dat-gui';
import THREE from '../Three';
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
    this.background = 0x222222;
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
    window.addEventListener('resize', this.resize, true);
    this.setRender();
    // this.setEffects();
    // this.createGUI();
    this.music();
    this.renderLoop();
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

  music = () => {
    const youtube = document.createElement('iframe');
    youtube.width=1;
    youtube.height=1;
    youtube.wmode='transparent';
    const html ='https://www.youtube.com/embed/gkyFQTUR-rA?rel=0&autoplay=1';
    youtube.src = encodeURI(html); // 'data:text/html;charset=utf-8,' + 
    youtube.frameborder=0;
    document.body.appendChild(youtube);
    
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
    const type = Math.random() * 100 > 94;
    const size = Math.random() * 100 > 54 ? 6 : 1;
    const amps = type ? 280 : 80 + Math.abs(200 * Math.cos((this.frames * 0.25 ) * Math.PI / 180));
    this.frames++;
    const sVar = amps * Math.sin(this.frames * 2.0 * Math.PI / 180);
    const cVar = amps * Math.cos(this.frames * 2.0 * Math.PI / 180);

    this.makeParticle(x + sVar, y + cVar, z, type, size);
    this.makeParticle(x - sVar, y + cVar, z, type, size);

    this.makeParticle(x + sVar, y - cVar, z, type, size);
    this.makeParticle(x - sVar, y - cVar, z, type, size);
  }

  makeParticle = (mx, my, mz, type, size) => {

    const geometry = type  ? 
      new THREE.SphereGeometry(this.size * 4, 6, 6, 0, Math.PI * 2, 0, Math.PI * 2) :
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
      size: this.size - Math.random() * 1,
      x: mx,
      y: my,
      z: mz,
      vx: -(0.0 - mx) * 0.001,
      vy: -(0.0 - my) * 0.001,
      vz: this.speed,
      box: this.box,
      settings: this.settings,
      ref: sphere
    });
  
    sphere.position.set(mx, my, mz);
    // const timez = this.frames * 0.1;
    // const particleColor = Math.abs(0.5 * Math.sin(this.frames * 0.35 * Math.PI / 180) * 0.75);

    // const cRed = type ? particleColor : Math.sin(particleColor * 10.0 - 6.0);
    // const cGreen = type ? particleColor : Math.cos(particleColor * 8.0 - 5.0);
    // const cBlue = type ? particleColor : Math.sin(particleColor * 8.0 - 4.0 * Math.PI / 180);

    // sphere.material.color.setRGB(cRed, cGreen ,cBlue);

    const particleColor = Math.abs(0.75 * Math.sin(this.frames * 0.25 * Math.PI / 180) * 0.75);
    sphere.material.color.setRGB(particleColor, particleColor ,particleColor);
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

    // const zd = (Math.sin(this.frames * 0.003 * Math.PI / 180));
    // this.camera.rotateZ(zd * Math.PI / 180);
    
    if(Math.random() * 255 > 230){
      this.speed = 5.0 + Math.random() * 35;
    }
    
    if(this.particles.length < 900) {
      this.hitRnd();
    }
    this.cameraLoop();
    this.renderScene();
    this.frames ++;
    window.requestAnimationFrame(this.renderLoop);
  };
}
