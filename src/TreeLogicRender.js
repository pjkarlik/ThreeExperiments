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

  getRandomVector = () => {
    const x = 0.0 + Math.random() * 25;
    const y = 0.0 + Math.random() * 35;
    const z = 0.0 + Math.random() * 15;
    return new THREE.Vector3(x, y, z);
  }
  createScene = () => {
    // Create custom material for the shader
    this.metalMaterial = new THREE.MeshBasicMaterial({
      envMap: this.skybox,
      side: THREE.DoubleSide
    });

    this.special = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2, 2, 2),
      this.metalMaterial
    );
    this.special.position.set(0, 0, 0);
    this.special.rotation.set(-90 * Math.PI / 180, 0, 0);
    this.scene.add(this.special);

    // Spline Creation //
    const curve = new THREE.SplineCurve3([
      // this.getRandomVector(),
      // this.getRandomVector(),
      // this.getRandomVector(),
      // this.getRandomVector(),
      // this.getRandomVector(),
      // this.getRandomVector(),
      // this.getRandomVector()
      new THREE.Vector3(0.0, 0.0, 0.0),
      new THREE.Vector3(0.0, 20.0, 0.0),
      new THREE.Vector3(15.0, 15.0, 0.0),
      new THREE.Vector3(15.0, 5.0, 0.0),
      new THREE.Vector3(25.0, 10.0, 0.0),
      new THREE.Vector3(25.0, 30.0, 0.0)
    ]);
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

    this.splineObject = new THREE.Mesh(
      tubeGeometry,
      this.metalMaterial
    );
    this.splineObject.scale.set(params.scale, params.scale, params.scale);
    this.scene.add(this.splineObject);
    console.log(this.splineObject);
  };

  resize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  renderScene = () => {
    // Core three Render call //
    this.renderer.render(this.scene, this.camera);
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
