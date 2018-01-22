import dat from 'dat-gui';
import THREE from '../Three';
import Particle from './Particle-alt';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.size = 7;
    this.speed = 3.0;
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

    this.camTimeoutx = true;
    this.camTimeouty = true;
    this.camTimeoutz = true;
    setTimeout(
      () => {
        this.camTimeoutx = false;
        this.camTimeouty = false;
        this.camTimeoutz = false;
      },
      1000
    );
    // Particles Stuff //

    this.particles = [];
    this.particleColor = 360;
    this.background = 0x232323;
    this.emitter = {
      x: 0,
      y: 0,
      z: -1200
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
      bounce: 0.75,
    };
    window.addEventListener('resize', this.resize, true);
    window.addEventListener('click', () => {
      console.log(this.camera.position);
    }, true);
    this.setRender();
    this.setEffects();
    // this.createGUI();
    this.renderLoop();

    setTimeout(() => {
      this.canSpeed = true;
      this.canFlip = true;
    }, 6000 + Math.random() * 1000);
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

    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxDistance = 2500;
    this.controls.minDistance = 0;

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
    this.effect = new THREE.AnaglyphEffect(this.renderer);
    this.effect.setSize(this.width, this.height);
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
  };

  distance = (x1, y1, x2, y2) => {
    const distance = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    return distance;
  };

  hitRnd = () => {
    const { x, y, z } = this.emitter;
    const type = Math.random() * 100 > 74;
    const size = 5 + Math.random() * 25;
    const amps = (type ? 900 : 400) + 200 * Math.cos((this.frames * 0.25 ) * Math.PI / 180);
    this.frames++;

    const dVar = 300 * Math.sin(amps * 0.5 * Math.PI / 180);
    const sVar = amps * Math.sin(this.frames * 3.0 * Math.PI / 180);
    const cVar = amps * Math.cos(this.frames * 2.0 * Math.PI / 180);
  
    this.makeParticle(x + sVar, y + cVar * 2, z, type, size);
    this.makeParticle(x - sVar, y - cVar * 2, z, type, size);
    this.makeParticle(x + sVar + dVar, y + cVar - dVar, z, type, size);
    this.makeParticle(x - sVar - dVar, y - cVar + dVar, z, type, size);
  }

  makeParticle = (mx, my, mz, type, size) => {
    const particleColor = Math.abs(0.65 * Math.sin(this.frames * 0.25 * Math.PI / 180) * 0.75);

    const geometry = !type ?
      new THREE.BoxGeometry(this.size * 3, this.size * 3, this.size * size) :
      new THREE.BoxGeometry(this.size * size, this.size * size, this.size * size);
    const sphere = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial(
        { color:0xFFFFFF, wireframe: false }
      )
    );
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    const point = new Particle({
      size: this.size - Math.random() * 1,
      x: mx,
      y: my,
      z: mz,
      vx: 0.001, // -(0.0 - mx) * 0.0001,
      vy: 0.001, //  -(0.0 - my) * 0.0001,
      vz: this.speed * 4,
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
    this.camPosition.z = this.camPosition.z - (this.camPosition.z - this.trsPosition.z) * 0.1;

    this.camera.position.set(
      this.camPosition.x,
      this.camPosition.y,
      this.camPosition.z
    );
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    if(!this.camTimeoutx && Math.random() * 255 > 240) {
      const tempRand = 1400 + Math.random() * 1000;
      this.trsPosition.x = Math.random() * 255 > 240 ? Math.random() * 255 > 250 ? -(tempRand) : tempRand : 0;
      this.camTimeoutx = true;
      setTimeout(
        () => { this.camTimeoutx = false; },
        3000
      );
    }
    if(!this.camTimeouty && Math.random() * 255 > 240) {
      const tempRand = 1300 + Math.random() * 1300;
      this.trsPosition.y = Math.random() * 255 > 240 ? Math.random() * 255 > 250 ? tempRand : -(tempRand) : 0;
      this.camTimeouty = true;
      setTimeout(
        () => { this.camTimeouty = false; },
        3000
      );
    }
    if(!this.camTimeoutz && Math.random() * 255 > 250) {
      this.trsPosition.z = Math.random() * 255 > 250 ? 0.0 : -1200;
      this.camTimeoutz = true;
      setTimeout(
        () => { this.camTimeoutz = false; },
        3000
      );
    }
  };

  renderScene = () => {
    // this.composer.render();
    // this.renderer.render(this.scene, this.camera);
    this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.checkParticles();

    if(Math.random() * 255 > 230 && this.canSpeed){
      this.canSpeed = false;
      // this.speed = 3.0 + Math.random() * 5;
      setTimeout(() => {
        this.canSpeed = true;
      }, 100 + Math.random() * 1000);
    }

    if(this.particles.length < 1200 && this.frames % 4 == 0) {
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