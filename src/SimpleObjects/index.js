import THREE from '../Three';

// Skybox image imports //
import xpos from '../../resources/images/church/posx.jpg';
import xneg from '../../resources/images/church/negx.jpg';
import ypos from '../../resources/images/church/posy.jpg';
import yneg from '../../resources/images/church/negy.jpg';
import zpos from '../../resources/images/church/posz.jpg';
import zneg from '../../resources/images/church/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 360;
    this.controls = undefined;
    this.scene = undefined;
    this.camera = undefined;
    this.render = undefined;
    this.skybox = undefined;
    this.amount = 30;
    this.spheres = [];
    window.addEventListener('resize', this.resize, true);
    this.setViewport();
    this.setRender();
    this.renderLoop();
  }

  setRender = () => {
    // Set Render and Scene //
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.bufferScene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
        this.viewAngle,
        this.aspect,
        this.near,
        this.far
    );

    this.camera.position.set(0, 1, -3);
    this.camera.lookAt(new THREE.Vector3(0, 1, 2));

    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxDistance = 1500;
    this.controls.minDistance = 0;

    // Set AmbientLight //
    this.ambient = new THREE.AmbientLight(0xFFFFFF);
    this.ambient.position.set(0, 0, 0);
    this.scene.add(this.ambient);

    // Skybox //
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    // const urls = [cright, cleft, ctop, cbottom, cfront, cback];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    this.skybox.mapping = THREE.CubeReflectionMapping; // CubeReflectionMapping || CubeRefractionMapping
    this.scene.background = this.skybox;

    // Refraction Textures //
    this.refractSphereCamera = new THREE.CubeCamera(0.1, 5000, 512);
    this.refractSphereCamera.position.set(0, 0, 0);
    this.scene.add(this.refractSphereCamera);

    this.fShader = THREE.FresnelShader;
    const fresnelUniforms = {
      mRefractionRatio: { type: 'f', value: 1.02 },
      mFresnelBias: { type: 'f', value: 0.1 },
      mFresnelPower: { type: 'f', value: 1.0 },
      mFresnelScale: { type: 'f', value: 0.5 },
    };

    // Create custom material for the shader
    this.metalMaterial = new THREE.MeshBasicMaterial({
      envMap: this.skybox,
    });

    this.dynamicReflection = new THREE.ShaderMaterial({
      uniforms: {
        ...fresnelUniforms,
        tCube: { type: 't', value: this.refractSphereCamera.renderTarget.texture },
      },
      vertexShader: this.fShader.vertexShader,
      fragmentShader: this.fShader.fragmentShader,
    });

    this.special = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 32, 0, Math.PI * 2, 0, Math.PI * 2),
      this.dynamicReflection,
    );
    this.special.position.set(0, 0, 0);
    this.scene.add(this.special);
    this.effect = new THREE.AnaglyphEffect(this.renderer);
    this.effect.setSize(this.width, this.height);
    this.randomSpheres();
  };

  randomSpheres = () => {
    for (let i = 0; i < this.amount; i++) {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 18, 24, 0, Math.PI * 2, 0, Math.PI * 2),
        this.metalMaterial,
      );
      this.spheres.push(sphere);
      this.scene.add(sphere);
    }
  };

  checkSpheres = () => {
    const amp = 1.25;
    const piender = Math.PI / 180;
    const radix = 360 / this.amount;
    const time = this.frames * 0.01;
    for (let i = 0; i < this.amount; i++) {
      const sphere = this.spheres[i];
      const xm = amp * Math.cos((360 / (time * radix)) * piender);
      const my = amp * Math.cos(time + (radix * i) * piender);
      const mx = amp * Math.sin(xm + (radix * i) * piender);
      const radiy = this.amount / xm;

      const mz = amp * Math.sin(time + (radiy * i) * Math.PI / 180);
      sphere.position.set(mx, my, mz);
      const scale = 1.5 + (mz * 0.65);
      sphere.scale.x = scale;
      sphere.scale.y = scale;
      sphere.scale.z = scale;
    }
  };

  setViewport = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.viewAngle = 85;
    this.aspect = this.width / this.height;
    this.near = 0.1;
    this.far = 20000;
    this.devicePixelRatio = window.devicePixelRatio;
  };

  resize = () => {
    this.setViewport();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  renderScene = () => {
    this.special.visible = false;
    this.refractSphereCamera.updateCubeMap(this.renderer, this.scene);
    this.special.visible = true;
    // this.renderer.render(this.scene, this.camera);
    this.effect.render(this.scene, this.camera);
  };
  renderLoop = () => {
    if (this.frames % 1 === 0) {
      this.checkSpheres();
    }
    this.renderScene();
    this.frames ++;
    window.requestAnimationFrame(this.renderLoop);
  };
}
