import THREE from './Three';
import { Generator } from './SimplexNoise';
import dat from 'dat-gui';

// Skybox image imports //
// import xpos from '../resources/images/space/posx.jpg';
// import xneg from '../resources/images/space/negx.jpg';
// import ypos from '../resources/images/space/posy.jpg';
// import yneg from '../resources/images/space/negy.jpg';
// import zpos from '../resources/images/space/posz.jpg';
// import zneg from '../resources/images/space/negz.jpg';


// Render Class Object //
export default class Render {
  constructor() {
    this.viewAngle = 55;
    this.near = 1;
    this.far = 10000;
    this.amount = 55;
    this.size = 1750;
    this.strength = 65;
    this.iteration = 0.35;
    this.spacing = this.size / this.amount;
    this.timer = 0;
    this.time = 0;
    this.frame = 0;
    this.background = 0x222222;
    this.fog = this.background;
    this.generator = new Generator(10);
    window.addEventListener('resize', this.resize, true);
    this.createGUI();
    this.setViewport();
    this.setRender();
    this.renderLoop();
  }

  createGUI = () => {
    this.options = {
      strength: 75,
      iteration: 65,
      color: [50, 50, 50],
      mesh: [200, 200, 200],
    };
    this.gui = new dat.GUI();

    const folderRender = this.gui.addFolder('Wave Options');
    folderRender.add(this.options, 'strength', 1, 100).step(1)
      .onFinishChange((value) => { this.strength = value; });
    folderRender.add(this.options, 'iteration', 1, 100).step(1)
      .onFinishChange((value) => { this.iteration = value * 0.002; });
    folderRender.addColor(this.options, 'color')
      .onChange(value => {
        this.color = this.rgbToHex(~~value[0], ~~value[1], ~~value[2]);
        this.scene.fog.color.setHex(this.color);
      });
    folderRender.addColor(this.options, 'mesh')
      .onChange(value => {
        this.mesh = this.rgbToHex(~~value[0], ~~value[1], ~~value[2]);
        this.meshMaterial.color.setHex(this.mesh);
      });
    // folderRender.open();
  };

  setRender = () => {
    // Set Render and Scene //
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.devicePixelRatio);
    this.renderer.shadowMapEnabled = true;
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(this.fog, 0.00185);
    this.camera = new THREE.PerspectiveCamera(
        this.viewAngle,
        this.aspect,
        this.near,
        this.far
    );
    this.scene.add(this.camera);
    this.cameraPosition = { x: -800, y: 300, z: 330 };
    this.camera.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
    this.camera.lookAt(this.scene.position);

    // this.controls = new THREE.OrbitControls(this.camera);
    // this.controls.maxDistance = 3000;
    // this.controls.minDistance = 0.1;

    // Set AmbientLight //
    this.ambient = new THREE.AmbientLight(0x999999);
    this.ambient.position.set(0, 0, 0);
    this.scene.add(this.ambient);

    this.spotLight = new THREE.DirectionalLight(0x0666666);
    this.spotLight.position.set(0, 10, 0);
    this.spotLight.castShadow = true;
    this.scene.add(this.spotLight);

    // const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    // this.skybox = new THREE.CubeTextureLoader().load(urls);
    // this.skybox.format = THREE.RGBFormat;
    // this.skybox.mapping = THREE.CubeReflectionMapping; // CubeReflectionMapping || CubeRefractionMapping

    const skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
    const skyBoxMaterial = new THREE.MeshBasicMaterial({ color: this.background, side: THREE.BackSide });
    this.lowSkybox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    this.scene.add(this.lowSkybox);

    this.meshMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      side: THREE.DoubleSide,
    });
    this.meshMaterial.wrapS = this.meshMaterial.wrapT = THREE.RepeatWrapping;
    this.geometry = new THREE.PlaneBufferGeometry(this.size, this.size, this.amount, this.amount);
    this.planeMesh = new THREE.Mesh(
      this.geometry,
      this.meshMaterial
    );

    this.planeMesh.rotation.set(90 * Math.PI / 180, 0, 0);
    this.planeMesh.position.set(0, 0, 0);
    this.scene.add(this.planeMesh);
    let effect;
    // this.effect = new THREE.AnaglyphEffect(this.renderer);
    // this.effect.setSize(this.width, this.height);
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

    // effect = new THREE.FilmPass(0.35, 0.5, 2048, true);
    // this.composer.addPass(effect);

    effect = new THREE.ShaderPass(THREE.MirrorShader);
    effect.uniforms.side.value = 1;
    this.composer.addPass(effect);

    effect = new THREE.ShaderPass(THREE.DotScreenShader);
    effect.uniforms.scale.value = 8;
    this.composer.addPass(effect);

    effect = new THREE.ShaderPass(THREE.RGBShiftShader);
    effect.uniforms.amount.value = 0.05;
    effect.uniforms.angle.value = 0.0;
    effect.renderToScreen = true;
    this.composer.addPass(effect);
  };

  camearAnimation = () => {
    this.camera.position.y = 225 + Math.sin(this.timer + Math.PI / 180) * 150;
    this.camera.position.x = Math.sin(this.timer + Math.PI / 180) * 120;
    this.camera.lookAt(this.scene.position);
  };

  checkObjects = () => {
    this.timer += 0.005;
    this.time += 0.2;
    this.timeStop = this.time * this.iteration;
    const offset = this.size / 2;
    const vertices = this.geometry.attributes.position.array;
    for (let y = 0; y < this.amount + 1; y ++) {
      for (let x = 0; x < this.amount + 1; x ++) {
        const vx = x * 3;
        const vy = y * ((this.amount + 1) * 3);
        const noiseX = this.generator.simplex3(
          x * this.iteration,
          y * this.iteration,
          this.timer,
        );
        vertices[vy + vx + 0] = (-offset) + x * this.spacing;
        vertices[vy + vx + 1] = ((-offset) + y * this.spacing);
        vertices[vy + vx + 2] = noiseX * this.strength;
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();
  };

  setViewport = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspect = this.width / this.height;
    this.devicePixelRatio = window.devicePixelRatio;
  };

  resize = () => {
    this.setViewport();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.effect.setSize(this.width, this.height);
  };

  rgbToHex = (r, g, b) => {
    const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return `0x${hex}`;
  };

  renderScene = () => {
    this.composer.render();
    // this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.camearAnimation();
    this.checkObjects();
    this.renderScene();
    window.requestAnimationFrame(this.renderLoop);
  };
}
