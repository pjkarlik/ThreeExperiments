require('./shader/WaveBowFragment');
//require('./shader/EdgeFragment');
import dat from 'dat-gui';
import THREE from './ThreeLight';

// Skybox image imports //
import xpos from '../resources/images/maskonaive/posx.jpg';
import xneg from '../resources/images/maskonaive/negx.jpg';
import ypos from '../resources/images/maskonaive/posy.jpg';
import yneg from '../resources/images/maskonaive/negy.jpg';
import zpos from '../resources/images/maskonaive/posz.jpg';
import zneg from '../resources/images/maskonaive/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.mirror = 1;
    this.scale = 2.5;
    this.ratio = 1024;
    this.frenz = 1024;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.devicePixelRatio = window.devicePixelRatio;
    // Configurations //
    this.cameraConfig = {
      position: [
        -0.61856619533,
        -0.37075002657,
        -1.10822670381
      ],
      lookAt: [0, 1, 2],
      aspect: this.width / this.height,
      viewAngle: 85,
      near: 0.1,
      far: 20000
    };
    this.controlConfig = {
      max: 1500,
      min: 0
    };
    this.amount = 2 + Math.abs(Math.random() * 26);
    this.adef = 360 / this.amount;
    this.splineObject = [];
    this.camPosition = {
      x: -1.61856619533,
      y: -1.37075002657,
      z: -1.10822670381
    };
    this.trsPosition = {
      x: -0.61856619533,
      y: -0.37075002657,
      z: -1.10822670381
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
      1000
    );
    window.addEventListener('resize', this.resize, true);
    window.addEventListener('click', () => {
      console.log(this.camera.position);
    }, true);
    this.init();
    this.createGUI();
    this.createScene();
    this.effectsSetup();
    this.renderLoop();
  }

  init = () => {
    // Set Render and Scene //
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.bufferScene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
        this.cameraConfig.viewAngle,
        this.cameraConfig.aspect,
        this.cameraConfig.near,
        this.cameraConfig.far
    );

    this.camera.position.set(...this.cameraConfig.position);
    this.camera.lookAt(new THREE.Vector3(...this.cameraConfig.lookAt));
    this.scene.add(this.camera);

    // Set AmbientLight //
    this.ambient = new THREE.AmbientLight(0xFFFFFF);
    this.ambient.position.set(0, 0, 0);
    this.scene.add(this.ambient);

    // Skybox //
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    // CubeReflectionMapping || CubeRefractionMapping//
    this.skybox.mapping = THREE.CubeReflectionMapping;
    this.scene.background = this.skybox;
  };

  createGUI = () => {
    this.options = {
      scale: this.scale,
      ratio: this.ratio,
      mirror: this.mirror
    };
    this.gui = new dat.GUI();

    const folderRender = this.gui.addFolder('Render Options');
    folderRender.add(this.options, 'mirror', 0, 4).step(1)
      .onFinishChange((value) => {
        this.mirror = value;
        this.setOptions();
      });
    folderRender.add(this.options, 'scale', 1, 20).step(0.1)
      .onFinishChange((value) => {
        this.scale = value * 1.0;
        this.setOptions();
      });
    folderRender.add(this.options, 'ratio', 512, 1024).step(1)
      .onFinishChange((value) => {
        this.ratio = value * 1.0;
        this.setOptions();
      });
    // folderRender.open();
  };

  setOptions() {
    this.effect.uniforms.side.value = this.mirror;
    this.rfrag.uniforms.scale.value = this.scale;
    this.rfrag.uniforms.ratio.value = this.ratio;
  };

  getRandomVector = (a, b, c) => {
    const x = (a || 0.0) + (10 - Math.random() * 20);
    const y = (b || 0.0) + (20 - Math.random() * 40);
    const z = (c || 0.0) + (10 - Math.random() * 20);
    return {x, y, z};
  };

  createScene = () => {
    // Create custom material for the shader
    this.metalMaterial = new THREE.MeshBasicMaterial({
      envMap: this.skybox,
      side: THREE.DoubleSide
    });

    // Spline Creation //
    const vcs = 14 + Math.abs(Math.random() * 24);
    let tempArray = [];
    let newChamber;
    let chamber = {x:0, y:0, z:0};
    tempArray.push(new THREE.Vector3(chamber.x, chamber.y, chamber.z));
    for(let i = 0; i < vcs; i++) {
      newChamber = this.getRandomVector(
        chamber.x, chamber.y, chamber.z
      );
      chamber = newChamber;
      tempArray.push(new THREE.Vector3(chamber.x, chamber.y, chamber.z));
    }
    // CatmullRomCurve3
    const curve = new THREE.CatmullRomCurve3([...tempArray]);

    const params = {
      scale: 0.015,
      extrusionSegments: 150,
      radiusSegments: 12,
      closed: false
    };

    const tubeGeometry = new THREE.TubeBufferGeometry(
      curve,
      params.extrusionSegments,
      2,
      params.radiusSegments,
      params.closed
    );

    for(let i = 0; i < this.amount; i++) {
      const tempSpline = new THREE.Mesh(
        tubeGeometry,
        this.metalMaterial
      );
      tempSpline.scale.set(params.scale, params.scale, params.scale);
      tempSpline.rotation.set(0, (i * this.adef) * Math.PI / 180, 0);
      this.splineObject.push(tempSpline);
      this.scene.add(tempSpline);
    }

  };

  effectsSetup = () => {
    let effect;
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

    const renderPass = new THREE.RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.effect = new THREE.ShaderPass(THREE.MirrorShader);
    this.effect.uniforms.side.value = this.mirror;

    this.composer.addPass(this.effect);

    this.rfrag = new THREE.ShaderPass(THREE.WaveBowFragment);
    this.rfrag.uniforms.scale.value = this.scale;
    this.rfrag.uniforms.ratio.value = this.ratio;
    this.rfrag.uniforms.frenz.value = this.frenz;
    this.rfrag.renderToScreen = true;
    this.composer.addPass(this.rfrag);

  };

  resize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  renderScene = () => {
    // Core three Render call //
    this.composer.render();
    // this.renderer.render(this.scene, this.camera);
  };

  cameraLoop = () => {
    this.camPosition.x = this.camPosition.x - (this.camPosition.x - this.trsPosition.x) * 0.01;
    this.camPosition.y = this.camPosition.y - (this.camPosition.y - this.trsPosition.y) * 0.01;
    this.camPosition.z = this.camPosition.z - (this.camPosition.z - this.trsPosition.z) * 0.01;
    this.camera.position.set(
      this.camPosition.x,
      this.camPosition.y,
      this.camPosition.z
    );
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    if(!this.camTimeoutx && Math.random() * 255 > 254) {
      this.trsPosition.x = this.cameraRange();
      this.camTimeoutx = true;
      setTimeout(
        () => { this.camTimeoutx = false; },
        3000
      );
    }
    if(!this.camTimeouty && Math.random() * 255 > 254) {
      this.trsPosition.y = this.cameraRange();
      this.camTimeouty = true;
      setTimeout(
        () => { this.camTimeouty = false; },
        3000
      );
    }
    if(!this.camTimeoutz && Math.random() * 255 > 254) {
      this.trsPosition.z = this.cameraRange();
      this.camTimeoutz = true;
      setTimeout(
        () => { this.camTimeoutz = false; },
        3000
      );
    }
  };

  cameraRange = () => {
    return (1.5 - Math.random() * 3);
  };
  renderLoop = () => {
    if (this.frames % 1 === 0) {
      // some function here for throttling
      this.frenz = Math.sin((this.frames * 0.02) + Math.PI / 180) * 1024.0;
      this.rfrag.uniforms.frenz.value = this.frenz;
    }
    this.renderScene();
    this.cameraLoop();
    this.frames ++;

    for(let i = 0; i < this.amount; i++) {
      const tempSpline = this.splineObject[i];
      const evenItem = (i % 2 === 0);
      tempSpline.rotation.set(
        ((i * this.adef) + this.frames) * Math.PI / 180,
        evenItem ? 0 : ((i * this.adef) + this.frames) * Math.PI / 180,
        !evenItem ? 0 : ((i * this.adef) + this.frames) * Math.PI / 180
      );
    }

    window.requestAnimationFrame(this.renderLoop.bind(this));
  };
}
