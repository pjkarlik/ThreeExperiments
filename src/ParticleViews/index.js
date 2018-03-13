import dat from 'dat-gui';
import THREE from './Three';
import Particle from './Particle';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 360;
    this.controls = undefined;
    this.scene = undefined;
    this.camera = undefined;
    this.render = undefined;
    this.skybox = undefined;
    this.clock = new THREE.Clock();
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
    this.background = 0x000000;
    this.particleColor = 0xFFFFFF;
    this.particles = [];
    this.emitter = {
      x: 0,
      y: 100,
      z: 0
    };
    const bsize = 5000;
    this.box = {
      top: bsize,
      left: -bsize,
      bottom: -bsize,
      right: bsize,
    };
    this.settings = {
      gravity: 0.001,
      bounce: 0.15,
    };
    this.threshold = 0.6;
    this.strength = 2.0;
    this.radius = 0.85;
    this.mirrorValue = 0;
    this.size = 2.5;
    this.length = 24;
    this.color = true;
    this.isWrireframe = false;
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
    this.createGUI();
    this.setEffects();
    // e4GJsV3PzsI // gkyFQTUR-rA // 3vnZnuqgh7U // tek7oOqsUj0 // zqkD9PpH8W8
    // FLe52f0oEHM // _xlw6lHjvx4 // MPK5qsUEeMQ // 0mzXjWxn1r0 // oJP69NEFQ4s
    this.music('oJP69NEFQ4s', '8 Bit Weapon | Phase I: Lexical Analysis');
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
      threshold: this.threshold,
      strength: this.strength,
      radius: this.radius,
      mirror: this.mirrorValue,
      gravity: this.settings.gravity,
      length: this.length,
      size: this.size,
      color: this.color,
      wireframe: this.isWrireframe
    };
    this.gui = new dat.GUI();
    const folderBloom = this.gui.addFolder('Bloom Options');
    folderBloom.add(this.options, 'threshold', 0, 1).step(0.01)
      .onFinishChange((value) => {
        this.bloomPass.threshold = 1.0 - value;
      });
    folderBloom.add(this.options, 'strength', 0, 4).step(0.1)
    .onFinishChange((value) => {
      this.bloomPass.strength = value;
    });
    folderBloom.add(this.options, 'radius', 0, 1).step(0.01)
    .onFinishChange((value) => {
      this.bloomPass.radius = value;
    });

    const folderObject = this.gui.addFolder('Object Options');
    folderObject.add(this.options, 'size', 0, 25).step(0.01)
    .onFinishChange((value) => {
      this.size  = value;
    });
    folderObject.add(this.options, 'length', 0, 45).step(0.01)
    .onFinishChange((value) => {
      this.length  = value;
    });
    folderObject.add(this.options, 'color')
    .onFinishChange((value) => {
      this.color = value;
    });
    folderObject.add(this.options, 'wireframe')
    .onFinishChange((value) => {
      this.isWrireframe = value;
    });
    const folderEnv = this.gui.addFolder('Environment Options');
    folderEnv.add(this.options, 'gravity', 0, 1).step(0.01)
    .onFinishChange((value) => {
      console.log(value);
      this.settings.gravity = value;
    });
    folderEnv.add(this.options, 'mirror', 0, 4).step(1)
    .onFinishChange((value) => {
      this.mirror.uniforms.side.value = value;
    });
    
    folderBloom.open();
  }

  music = (videoID, songTitle) => {
    const youtube = document.createElement('iframe');
    const videoURL = `https://www.youtube.com/embed/${videoID}?rel=0&autoplay=1`;
    const thumbURL = `https://img.youtube.com/vi/${videoID}/sddefault.jpg`;
    youtube.width=1;
    youtube.height=1;
    const videoid = '3vnZnuqgh7U';
    youtube.wmode='transparent';

    youtube.src = encodeURI(videoURL); // 'data:text/html;charset=utf-8,' +
    youtube.frameborder=0;
    document.body.appendChild(youtube);
    const overlay = document.createElement('div');
    const link = document.createElement('a');
    const image = document.createElement('img');
    image.src = thumbURL;
    image.width = 60;
    image.height = 45;
    image.style.float = 'left';
    image.style.margin = '0 0 0 15px';
    overlay.style.position = 'absolute';
    overlay.style.bottom = '15px';
    overlay.style.left = '0';
    overlay.style.lineHeight = '45px';
    overlay.style.zIndex = '9999';
    link.href = videoURL;
    link.innerHTML = songTitle;
    link.style.textDecoration = 'none';
    link.style.color = '#FFF';
    link.style.padding = '15px';
    link.style.fontSize = '12px';
    overlay.appendChild(image);
    overlay.appendChild(link);
    document.body.appendChild(overlay);
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
    pointLight.position.set(250, 250, -900);
    this.scene.add(pointLight);
    pointLight = new THREE.PointLight(0xEEEEEE);
    pointLight.position.set(-250, -250, 900);
    this.scene.add(pointLight);
    let ambient = new THREE.AmbientLight(0x9f9f9f);
    ambient.position.set(0, 650, -150);
    this.scene.add(ambient);
    ambient = new THREE.AmbientLight(0x9f9f9f);
    ambient.position.set(-800, -850, 250);
    this.scene.add(ambient);
  };
  
  setEffects = () => {
    let effect;
 
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

    this.mirror = new THREE.ShaderPass(THREE.MirrorShader);
    this.mirror.uniforms.side.value = this.mirrorValue;
    this.composer.addPass(this.mirror);

    this.bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
     this.strength, this.radius, 1.0 - this.threshold
    );

    this.composer.addPass(this.bloomPass);

    const copyEffect = new THREE.ShaderPass(THREE.CopyShader);
    copyEffect.renderToScreen = true;
    this.composer.addPass(copyEffect);
  }

  hitRnd = () => {
    const { x, y, z } = this.emitter;

    const iter = 2;
    const amps = 225;
    const amps2 = amps *2;

    this.frames++;
    const frame = this.frames;
    const gVar = amps2 * Math.sin((frame * 0.4) * iter * Math.PI / 180);
    const fVar = amps2 * Math.cos((frame * 0.3) * iter * Math.PI / 180);

    const sVar = amps * Math.sin(frame * iter * Math.PI / 180);
    const cVar = gVar * Math.cos(frame * iter * Math.PI / 180);
    const dVar = amps * Math.cos((frame * 0.5) * Math.PI / 180);
    
    this.makeParticle(x + sVar, y + cVar, z + dVar + (fVar * 0.6));
    this.makeParticle(x + cVar, y + fVar, z + gVar + (sVar * 0.6));
    this.makeParticle(x + fVar, y + gVar, z + sVar - (cVar * 1.6));

  };

  makeParticle = (mx, my, mz) => {
    const geometry = new THREE.BoxGeometry(this.size, this.size * this.length, this.size);
    const sphere = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        specular: 0x999999,
        wireframe: this.isWrireframe
      })
    );
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    const point = new Particle({
      size: this.size,
      x: mx,
      y: my,
      z: mz,
      vx: -(1 - mx) * 0.0001,
      vy: -(1 - my) * 0.0001,
      vz: 3.5,
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

    if (this.color) {
      const particleColor = Math.abs(Math.sin(this.frames * 0.25 * Math.PI / 180) * 0.75);
      sphere.material.color.setHSL(particleColor,1,0.5);
    } else {
      const offsetColor  = 0.85 - Math.abs(Math.cos(this.frames * 0.25 * Math.PI / 180) );
      sphere.material.color.setRGB(offsetColor, offsetColor, offsetColor);
    }
    
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
        part.ref.geometry.dispose();
        part.ref.material.dispose();
        this.scene.remove(part.ref);
        part.ref = undefined;
        this.particles.splice(i, 1);
      }
    }
  };

  cameraLoop = () => {
    const damp = 0.008;
    this.camPosition.x = this.camPosition.x - (this.camPosition.x - this.trsPosition.x) * damp;
    this.camPosition.y = this.camPosition.y - (this.camPosition.y - this.trsPosition.y) * damp;
    this.camPosition.z = this.camPosition.z - (this.camPosition.z - this.trsPosition.z) * 0.006;

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
      const tempRand = 100 + Math.random() * 500;
      this.trsPosition.y = Math.random() * 255 > 200 ?
        Math.random() * 250 > 100 ? tempRand : -(tempRand * 3) : 0;
      this.camTimeouty = true;
      setTimeout(
        () => { this.camTimeouty = false; },
        6000 + (1000 * Math.random() * 20)
      );
    }
    if(!this.camTimeoutz && Math.random() * 255 > 225) {
      const tempRand = 400 + (25 * Math.random() * 20);
      this.trsPosition.z = Math.random() * 200 > 100 ? tempRand * 4 : -(tempRand);
      this.camTimeoutz = true;
      setTimeout(
        () => { this.camTimeoutz = false; },
        18000 + (1000 * Math.random() * 7)
      );
    }
  };

  renderScene = () => {
    this.composer.render(this.clock.getDelta());
    // this.renderer.render(this.scene, this.camera);
    // this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.frames ++; 
    if(this.frames % 2 === 0 && this.particles.length < 2600) {
      this.hitRnd();
    }
    this.checkParticles();
    this.cameraLoop();
    this.renderScene();
    window.requestAnimationFrame(this.renderLoop);
  };
}
