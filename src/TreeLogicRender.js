import THREE from './Three';

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
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.devicePixelRatio = window.devicePixelRatio;
    // Configurations //
    this.cameraConfig = {
      position: [0, 1, 3],
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
    window.addEventListener('resize', this.resize, true);

    this.init();
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

    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxDistance = 1500;
    this.controls.minDistance = 0;

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

  getRandomVector = (a, b, c) => {
    const x = (a || 0.0) + (10 - Math.random() * 20);
    const y = (b || 0.0) + (10 - Math.random() * 20);
    const z = (c || 0.0) + (10 - Math.random() * 20);
    return {x, y, z};
  }
  createScene = () => {
    // Create custom material for the shader
    this.metalMaterial = new THREE.MeshBasicMaterial({
      envMap: this.skybox,
      side: THREE.DoubleSide
    });

    // this.special = new THREE.Mesh(
    //   new THREE.PlaneGeometry(2, 2, 2, 2),
    //   this.metalMaterial
    // );
    // this.special.position.set(0, 0, 0);
    // this.special.rotation.set(-90 * Math.PI / 180, 0, 0);
    // this.scene.add(this.special);

    // Spline Creation //
    const vcs = 10 + Math.abs(Math.random() * 25);
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
    console.log(tempArray);
    const curve = new THREE.SplineCurve3([...tempArray]);

      // new THREE.Vector3(0.0, 0.0, 0.0),
      // new THREE.Vector3(0.0, 20.0, 0.0),
      // new THREE.Vector3(15.0, 15.0, 0.0),
      // new THREE.Vector3(15.0, 5.0, 0.0),
      // new THREE.Vector3(25.0, 10.0, 0.0),
      // new THREE.Vector3(25.0, 30.0, 0.0)

    const params = {
      scale: 0.05,
      extrusionSegments: 100,
      radiusSegments: 6,
      closed: false
    };

    const tubeGeometry = new THREE.TubeBufferGeometry(
      curve,
      params.extrusionSegments,
      2,
      params.radiusSegments,
      params.closed
    );

    this.splineObject = [];
    const amount = 3;
    const adef = 360 / amount;
    for(let i = 0; i < 6; i++) {
      const tempSpline = new THREE.Mesh(
        tubeGeometry,
        this.metalMaterial
      );
      tempSpline.scale.set(params.scale, params.scale, params.scale);
      // tempSpline.rotation.x = (10 - Math.random() * 20) * Math.PI / 180;
      // tempSpline.rotation.y = (10 - Math.random() * 20) * Math.PI / 180;
      // tempSpline.rotation.z = (10 - Math.random() * 20) * Math.PI / 180;
      tempSpline.rotation.set(0, i * adef, i * adef);
      console.log(tempSpline.rotation.z);
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

    // effect = new THREE.ShaderPass(THREE.MirrorShader);
    // effect.uniforms.side.value = 1;
    // this.composer.addPass(effect);

    // this.edge = new THREE.ShaderPass(THREE.EdgeShader2);
    // this.edge.uniforms.aspect.value = new THREE.Vector2( 512, 512 );
    // this.edge.renderToScreen = true;
    // this.composer.addPass(this.edge);

    // this.composer.addPass(this.effect);

    // effect = new THREE.ShaderPass(THREE.DotScreenShader);
    // effect.uniforms.scale.value = 5.75;
    // effect.uniforms.scale.angle = 1.75;
    // effect.renderToScreen = true;
    // this.composer.addPass(effect);

    this.huez = new THREE.ShaderPass(THREE.RGBShiftShader);
    this.huez.uniforms.amount.value = 0.0065;
    this.huez.uniforms.angle.value = 0.0;
    this.huez.renderToScreen = true;
    this.composer.addPass(this.huez);

    // this.effect = new THREE.ShaderPass(THREE.KaleidoShader);
    // this.effect.uniforms.sides.value = 2;
    // this.effect.renderToScreen = true;
    //this.composer.addPass(this.effect);
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

  renderLoop = () => {
    if (this.frames % 1 === 0) {
      // some function here for throttling
    }
    this.renderScene();
    this.frames ++;
    window.requestAnimationFrame(this.renderLoop.bind(this));
  };
}
