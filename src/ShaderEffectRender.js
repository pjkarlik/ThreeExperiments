import dat from 'dat-gui';
import THREE from './Three';

import fragmentShader from './shader/position/fragmentShadert305';
// import fragmentShaderA from './shader/position/fragmentShadert302a';
import vertexShader from './shader/position/vertexShadert3';

// Skybox image imports //
import xpos from '../resources/images/yokohama/posx.jpg';
import xneg from '../resources/images/yokohama/negx.jpg';
import ypos from '../resources/images/yokohama/posy.jpg';
import yneg from '../resources/images/yokohama/negy.jpg';
import zpos from '../resources/images/yokohama/posz.jpg';
import zneg from '../resources/images/yokohama/negz.jpg';


// Render Class Object //
export default class Render {
  constructor() {
    this.start = Date.now();
    this.angle = 255.0;
    this.dec = 68.0;
    this.frames = 0;
    this.speed = 62;
    this.sides = 8;
    this.hueShift = 65;
    this.vector = { x: 512, y: 512 };
    this.stopFrame = 0;
    this.tubes = [];
    this.isRnd = true;
    this.allowChange = false;
    this.stopFrame = 0.00001;
    this.timeout = 6000;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.devicePixelRatio = window.devicePixelRatio;
    // Configurations //
    this.cameraConfig = {
      position: [0, 0, 0],
      lookAt: [0, 0, 0],
      aspect: this.width / this.height,
      viewAngle: 75,
      near: 0.1,
      far: 10000
    };
    this.controlConfig = {
      max: 1500,
      min: 0
    };

    window.addEventListener('resize', this.resize, true);
    this.createGUI();
    this.init();
  }

  init = () => {
    // Set Render and Scene //
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.devicePixelRatio);
    this.renderer.setFaceCulling(THREE.CullFaceNone);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.bufferScene = new THREE.Scene();
    // this.scene.fog = new THREE.FogExp2(0x000000, 0.0275);
    this.camera = new THREE.PerspectiveCamera(
        this.cameraConfig.viewAngle,
        this.cameraConfig.aspect,
        this.cameraConfig.near,
        this.cameraConfig.far
    );

    this.camera.position.set(...this.cameraConfig.position);
    this.camera.lookAt(new THREE.Vector3(...this.cameraConfig.lookAt));
    this.scene.add(this.camera);

    // Set Light //
    // this.camlight = new THREE.PointLight(0xAAAAAA, 5, 80);
    // this.scene.add(this.camlight);
    this.lightA = new THREE.PointLight(0xFFFFFF, 1, 250);
    this.scene.add(this.lightA);
    this.lightB = new THREE.PointLight(0xFFFFFF, 1, 350);
    this.scene.add(this.lightB);

    // Skybox //
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    const skybox = new THREE.CubeTextureLoader().load(urls);
    skybox.format = THREE.RGBFormat;
    skybox.mapping = THREE.CubeRefractionMapping;
    this.scene.background = skybox;
    this.skybox = skybox;
    this.createScene();
    this.setOptions();
  };

  createGUI = () => {
    this.options = {
      sides: this.sides,
      speed: this.speed,
      hueShift: this.hueShift,
      dec: this.dec,
      vectorX: this.vector.x,
      vectorY: this.vector.y
    };
    this.gui = new dat.GUI();

    const folderRender = this.gui.addFolder('Render Options');
    folderRender.add(this.options, 'sides', 2, 32).step(1)
      .onFinishChange((value) => {
        this.sides = value;
        this.setOptions();
      });
    folderRender.add(this.options, 'speed', 1, 500).step(1)
      .onFinishChange((value) => {
        this.speed = value;
        this.setOptions();
      });
    folderRender.add(this.options, 'dec', 0, 100).step(1)
      .onFinishChange((value) => {
        this.dec = value;
        this.setOptions();
      });
    // folderRender.add(this.options, 'vectorY', 0, 512).step(1)
    //   .onFinishChange((value) => {
    //     this.vector.y = value;
    //     this.setOptions();
    //   });
    // folderRender.add(this.options, 'iteration', 1, 100).step(1)
    //   .onFinishChange((value) => { this.iteration = value; });
    // folderRender.addColor(this.options, 'color')
    //   .onChange((value) => {
    //     this.color = this.rgbToHex(~~(value[0]), ~~(value[1]), ~~(value[2]));
    //     // this.planeMesh.material.color.setHex(this.color);
    //     this.scene.fog.color.setHex(this.color);
    //   });

    folderRender.open();
  };

  setOptions() {
    this.effect.uniforms.sides.value = this.sides;
    //this.huez.uniforms.amount.value = this.hueShift * 0.0001;
    // this.edge.uniforms.aspect.value = new THREE.Vector2(
    //   this.vector.x * 0.1, this.vector.y
    // );
  }
  getRandomVector = () => {
    const x = 0.0 + Math.random() * 255;
    const y = 0.0 + Math.random() * 255;
    const z = 0.0 + Math.random() * 255;
    return new THREE.Vector3(x, y, z);
  };

  makeTube = (points) => {
    const size = 0.1 + Math.random();
    return new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(this.makeRandomPath(points)),
          600,
          size,
          16,
          false
        ),
      this.meshMaterial2,
    );
  };

  createScene = () => {
    /* eslint no-multi-assign: 0 */
    const uniforms = THREE.UniformsUtils.merge([
      THREE.UniformsLib.lights,
      THREE.UniformsLib.shadowmap,
      {
        map: {
          type: 't',
          value: 1,
          texture: null,
        },
        time: {
          type: 'f',
          value: this.start,
        },
        angle: {
          type: 'f',
          value: this.angle,
        },
        dec: {
          type: 'f',
          value: this.dec,
        },
        resolution: {
          type: 'v2',
          value: new THREE.Vector3(),
        },
      },
    ]);

    this.meshMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });
    //
    // this.meshMaterial2 = new THREE.ShaderMaterial({
    //   uniforms,
    //   vertexShader,
    //   fragmentShader: fragmentShaderA,
    //   transparent: true,
    //   side: THREE.DoubleSide,
    //   blending: THREE.NormalBlending
    // });

    const initialPoints = [
      [0.0, 0.0, 600.0],
      [0.0, 0.0, 0.0],
      [1200.0, 0.0, 0.0],
      [1200.0, 1200.0, 0.0],
      [1200.0, 1200.0, 600.0],
      [1200.0, 600.0, 1200.0],
      [1200.0, 0.0, 1200.0],
      [0.0, 0.0, 1200.0],
      [0.0, 0.0, 600.0]
    ];

    const points = initialPoints.map((point) => {
      const v3Point = new THREE.Vector3(...point);
      return v3Point;
    });

    this.path1 = new THREE.CatmullRomCurve3(points);

    const tube1 = new THREE.Mesh(
      new THREE.TubeGeometry(
        this.path1,
        300,
        55,
        24,
        true
      ),
      this.meshMaterial
    );
    // tube1.castShadow = true;
    // tube1.receiveShadow = true;
    this.scene.add(tube1);

    this.effectsSetup();
    setTimeout(() => {
      this.allowChange = true;
    }, this.timeout);
    this.renderLoop();
  };

  effectsSetup = () => {
    let effect;
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

    const renderPass = new THREE.RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // effect = new THREE.ShaderPass(THREE.MirrorShader);
    // effect.uniforms.side.value = 1;
    // this.composer.addPass(effect);

    // this.edge = new THREE.ShaderPass(THREE.EdgeShader2);
    // this.edge.uniforms.aspect.value = new THREE.Vector2( 512, 512 );
    // this.composer.addPass(this.edge);

    // this.composer.addPass(this.effect);

    // effect = new THREE.ShaderPass(THREE.DotScreenShader);
    // effect.uniforms.scale.value = 5.75;
    // effect.uniforms.scale.angle = 1.75;
    // this.composer.addPass(effect);

    // this.huez = new THREE.ShaderPass(THREE.RGBShiftShader);
    // this.huez.uniforms.amount.value = 0.0065;
    // this.huez.uniforms.angle.value = 0.0;

    this.effect = new THREE.ShaderPass(THREE.KaleidoShader);
    this.effect.uniforms.sides.value = 19;
    this.effect.renderToScreen = true;
    this.composer.addPass(this.effect);
  };

  makeRandomPath = (pointList) => {
    this.pointsIndex = [];
    // const totalItems = pointList.length;
    const randomPoints = pointList.map((point) => {
      const check = true; // index > 0 && index < totalItems;
      const rx = 20 - Math.random() * 40;
      const ry = 20 - Math.random() * 40;

      const tx = check ? point[0] + rx : point[0];
      const ty = check ? point[1] + ry : point[1];
      const tz = point[2];
      const v3Point = new THREE.Vector3(tx, ty, tz);
      this.pointsIndex.push(v3Point);
      return v3Point;
    });
    return randomPoints;
  };

  resize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  renderScene = () => {
    // Shader Code //
    const timeNow = (Date.now() - this.start) / 1000;
    this.meshMaterial.uniforms.time.value = timeNow;
    // this.meshMaterial2.uniforms.time.value = timeNow;
    this.meshMaterial.uniforms.dec.value = this.dec;
    this.meshMaterial.uniforms.needsUpdate = true;
    // this.meshMaterial2.uniforms.needsUpdate = true;
    // Get stopFrame
    this.stopFrame += (this.speed * 0.00001);
    const realTime = this.frames * 0.005;
    // Get the point at the specific percentage
    const lvc = this.isRnd ? 0.03 : -(0.03);
    const p1 = this.path1.getPointAt(Math.abs((this.stopFrame) % 1));
    const p2 = this.path1.getPointAt(Math.abs((this.stopFrame + lvc) % 1));
    const p3 = this.path1.getPointAt(Math.abs((this.stopFrame + 0.06) % 1));

    if (Math.random() * 255 > 254 && this.allowChange) {
      this.isRnd = !this.isRnd;
      this.allowChange = false;
      setTimeout(() => {
        this.allowChange = true;
      }, this.timeout);
    }

    const amps = 12 * Math.sin(realTime + 1 * Math.PI / 180);
    const tempX = amps * Math.cos(realTime + 1 * Math.PI / 180) * 0.25;
    const tempY = 1 + amps * Math.sin(realTime + 1 * Math.PI / 180) * 0.25;

    // this.huez.uniforms.amount.value = tempX * 0.1;
    // this.huez.uniforms.angle.value = 0; //Math.sin(tempX * Math.PI / 180) * 255;
    // Camera
    this.camera.position.set(p1.x + tempX, p1.y + tempY, p1.z);
    this.camera.lookAt(p2);
    // Lights
    this.lightA.position.set(p2.x, p2.y, p2.z);
    this.lightB.position.set(p3.x, p3.y, p3.z);
    // Core three Render call //
    this.composer.render();
    // this.renderer.render(this.scene, this.camera);
    // this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    window.requestAnimationFrame(this.renderLoop.bind(this));
    this.frames ++;
    this.renderScene();
  };
}
