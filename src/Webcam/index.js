// import dat from 'dat-gui';
import THREE from './Three';

import Canvas from './Canvas';

const Can = new Canvas();

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
    this.video = null;
    // Background Canvas for Video //
    this.bgCanvasReturn = Can.createCanvas('bgcanvas');
    this.bgCanvas = this.bgCanvasReturn.canvas;
    this.bgContext = this.bgCanvasReturn.context;

    // Camera Stuff and Viewport //
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspect = this.width / this.height;
    this.devicePixelRatio = window.devicePixelRatio;
    this.viewAngle = 65;
    this.aspect = this.width / this.height;
    this.near = 0.1;
    this.far = 20000;
    this.camPosition = {
      x: 50.0,
      y: 0.0,
      z: 600.0
    };
    this.trsPosition = {
      x: 50.0,
      y: 945.0,
      z: 600.0
    };
    this.background = 0x000000;
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
    this.intensity = 0.26;
    this.time = 0;
    this.frames = 0;
    this.sizing = 50;
    this.spacing = Math.floor(this.width / this.sizing);
    this.baseRadius = 20;

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
    this.startWebcam('video', 640, 480);
    this.setRender();
    // this.setEffects();
  }

  startWebcam = (id, width, height) => {
    const videoBlock = document.createElement('video');
    videoBlock.className = 'video';
    videoBlock.width = width;
    videoBlock.height = height;
    videoBlock.id = id;
    videoBlock.setAttribute('autoplay',true);
    document.body.appendChild(videoBlock);

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

    if (navigator.getUserMedia) { // get webcam feed if available
      navigator.getUserMedia({video: true, audio: false},
        (stream) => {
          this.video = document.getElementById('video');
          try {
            this.video.srcObject  = stream;
          } catch (error) {
            console.log(error);
            this.video.src = window.URL.createObjectURL(stream);
          }
          setTimeout(()=>{
            this.drawImageToBackground(this.video);
            this.renderLoop();
          },300);
        },
        () => {
          console.log('error');
        }
      );
    }
  };

  resize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.bgCanvas.width = window.innerWidth;
    this.bgCanvas.height = window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.setUpGrid();
  };

  setRender = () => {
    // Set Render and Scene //
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.devicePixelRatio);
    this.renderer.domElement.id = 'threeCanvas';
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
    pointLight.position.set(850, 850, -900);
    this.scene.add(pointLight);
    pointLight = new THREE.PointLight(0xEEEEEE);
    pointLight.position.set(-850, -850, 900);
    this.scene.add(pointLight);
    let ambient = new THREE.AmbientLight(0x9f9f9f);
    ambient.position.set(700, 650, -750);
    this.scene.add(ambient);
    ambient = new THREE.AmbientLight(0x9f9f9f);
    ambient.position.set(-700, -650, 750);
    this.scene.add(ambient);

    this.setUpGrid();
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
  };

  rgbToHex = (r, g, b) => {
    return `0x${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  setUpGrid = () => {
    if(this.blocks && this.blocks.length > 1) {
      this.blocks.forEach((block) => {
        block.ref.geometry.dispose();
        block.ref.material.dispose();
        this.scene.remove(block.ref);
      });
    };
    this.blocks = [];


    this.cols = ~~(this.width / this.spacing);
    this.rows = ~~(this.height / this.spacing);

    for( let i = 0; i < this.rows; i++ ) {
      for ( let j = 0; j < this.cols; j++ ) {
        const radius = 5.0; // currentPoint.radius;
        const color = { r: 255, g: 255, b: 255 };

        const baseSize = this.spacing * 0.25;
        const adjust = baseSize / 2;
        const x = (this.width / 2) - (j * this.spacing) - adjust;
        const y = (this.height / 2) - (i * this.spacing) - adjust;
        const block = this.makeParticle(
          x,
          y,
          0.0,
          baseSize,
          color);
        this.blocks.push({
          x, y, z: 0.0, radius: baseSize, color: color, ref: block
        });
      }
    }
  };

  getPixelData = ( x, y, width, height ) => {
    let pixels;
    if ( x === undefined ) {
      pixels = this.bgContext.getImageData( 0, 0, this.width, this.height );
    } else {
      pixels = this.bgContext.getImageData( x, y, width, height );
    }
    return pixels;
  };

  preparePoints = () => {
    this.points = [];
    this.cols = ~~(this.width / this.spacing);
    this.rows = ~~(this.height / this.spacing);
    const pixelData = this.getPixelData();

    const colors = pixelData.data;

    for( let i = 0; i < this.rows; i++ ) {
      for ( let j = 0; j < this.cols; j++ ) {

        const pixelPosition = ( (j * this.spacing) + (i * this.spacing) * pixelData.width ) * 4;
        // We only need one color here... since they are all the same.
        const brightness = 0.24 * colors[pixelPosition] + 0.5 * colors[pixelPosition + 1]
          + 0.16 * colors[pixelPosition + 2];
        const baseRadius = this.calculateRadius( j, i, brightness );
        const color = {
          r: colors[pixelPosition],
          g: colors[pixelPosition + 1],
          b: colors[pixelPosition + 2]
        };
        const object = { x: j, y: i, z: 0, radius: baseRadius, color: color };
        // console.log(this.points);
        this.points.push( object );
      }
    }
  };

  calculateRadius = ( x, y, color) => {
    const radius = ( this.baseRadius * ( color / this.sizing ) );
    return radius * this.intensity;
  };

  makeParticle = (mx, my, mz, size, color) => {
    // const hexColor = this.rgbToHex(color.r, color.g, color.b);
    const geometry = new THREE.PlaneGeometry(size, size, 1);
    const blox = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial({
        color: 0x000000, // new THREE.Color(hexColor)
        wireframe: false,
        side: THREE.DoubleSide
      })
    );
    blox.castShadow = true;
    blox.receiveShadow = true;
    blox.position.set(mx, my, mz);

    blox.scale.x = size;
    blox.scale.y = size;
    blox.scale.z = size;
    blox.material.color.setRGB(color.r, color.b, color.g);
    this.scene.add(blox);
    return blox;
  };

  checkParticles = () => {
    if (this.points.length < 0) { return; }
    for (let i = 0; i < this.blocks.length; i++) {
      const part = this.blocks[i];
      const point = this.points[i];
      // part.settings = this.settings;


      const size = 1.0 - Math.abs(0.45 * point.radius);
      part.ref.scale.x = size;
      part.ref.scale.y = size;
      part.ref.scale.z = size + (point.radius * 0.25);

      part.ref.position.set(
        part.x,
        part.y,
        part.z + (point.radius * 10)
      );

      // const mul = 0.01;
      part.ref.material.color.setHex(
        this.rgbToHex(point.color.r,point.color.b,point.color.g)
      );
      // part.ref.material.color.setRGB(
      //   point.color.r / 255,
      //   point.color.b / 255,
      //   point.color.g / 255
      // );
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
      const tempRand = 400 + Math.random() * 1000;
      this.trsPosition.x = Math.random() * 255 > 200 ?
        Math.random() * 250 > 100 ? -(tempRand) : tempRand : -5;
      this.camTimeoutx = true;
      setTimeout(
        () => { this.camTimeoutx = false; },
        6000 + (1000 * Math.random() * 20)
      );
    }
    if(!this.camTimeouty && Math.random() * 260 > 200) {
      const tempRand = 400 + Math.random() * 500;
      this.trsPosition.y = Math.random() * 255 > 200 ?
        Math.random() * 250 > 100 ? tempRand : -(tempRand * 3) : 45;
      this.camTimeouty = true;
      setTimeout(
        () => { this.camTimeouty = false; },
        6000 + (1000 * Math.random() * 20)
      );
    }
    if(!this.camTimeoutz && Math.random() * 255 > 225) {
      const tempRand = 900 + (25 * Math.random() * 15);
      this.trsPosition.z = Math.random() * 200 > 100 ? tempRand : -(tempRand);
      this.camTimeoutz = true;
      setTimeout(
        () => { this.camTimeoutz = false; },
        18000 + (1000 * Math.random() * 7)
      );
    }
  };

  renderScene = () => {
    // this.composer.render(this.clock.getDelta());
    this.renderer.render(this.scene, this.camera);
    // this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {

    this.frames ++;

    if(this.frames % 2 === 0) {
      this.drawImageToBackground(this.video);
    }
    this.checkParticles();
    this.cameraLoop();
    this.renderScene();
    window.requestAnimationFrame(this.renderLoop);
  };

  drawImageToBackground = (image) => {
    this.bgContext.drawImage( image, 0, 0, this.bgCanvas.width,
      this.bgCanvas.height);
    this.preparePoints();
  };

}
