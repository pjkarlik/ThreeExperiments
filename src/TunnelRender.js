import THREE from './Three';

// Skybox image imports //
import xpos from '../resources/images/maskonaive/posx.jpg';
import xneg from '../resources/images/maskonaive/negx.jpg';
import ypos from '../resources/images/maskonaive/posy.jpg';
import yneg from '../resources/images/maskonaive/negy.jpg';
import zpos from '../resources/images/maskonaive/posz.jpg';
import zneg from '../resources/images/maskonaive/negz.jpg';
import stone from '../resources/images/grate.jpg';
// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.devicePixelRatio = window.devicePixelRatio;
    // Configurations //
    this.cameraConfig = {
      position: [0, 0, -100],
      lookAt: [0, 0, 0],
      aspect: this.width / this.height,
      viewAngle: 45,
      near: 0.001,
      far: 10000
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
    this.scene.fog = new THREE.FogExp2(0x9900AA, 0.0275);
    this.camera = new THREE.PerspectiveCamera(
        this.cameraConfig.viewAngle,
        this.cameraConfig.aspect,
        this.cameraConfig.near,
        this.cameraConfig.far
    );

    this.camera.position.set(...this.cameraConfig.position);
    // this.camera.lookAt(new THREE.Vector3(...this.cameraConfig.lookAt));
    this.scene.add(this.camera);

    // this.controls = new THREE.OrbitControls(this.camera);
    // this.controls.maxDistance = 1500;
    // this.controls.minDistance = 0;

    // Set AmbientLight //
    // this.ambient = new THREE.AmbientLight(0xFFFFFF);
    // this.ambient.position.set(0, 0, 0);
    // this.scene.add(this.ambient);
    this.light = new THREE.PointLight(0xAA00FF, 1, 50);
    this.scene.add(this.light);
    // Skybox //
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    // CubeReflectionMapping || CubeRefractionMapping//
    this.skybox.mapping = THREE.CubeRefractionMapping;
    // this.scene.background = this.skybox;
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
    const texloader = new THREE.TextureLoader();
    /* eslint no-multi-assign: 0 */
    const texture = texloader.load(stone, () => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.offset.set(0, 0);
      texture.repeat.set(100, 6);
    });
    this.tunnelMaterial = new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const initialPoints = [
      [68.5, 185.5],
      [1, 262.5],
      [270.9, 281.9],
      [345.5, 212.8],
      [178, 155.7],
      [240.3, 72.3],
      [153.4, 0.6],
      [52.6, 53.3],
      [68.5, 185.5]
    ];
    const points = initialPoints.map((point) => {
      const v3Point = new THREE.Vector3(point[0], 0.0, point[1]);
      return v3Point;
    });
    this.path = new THREE.CatmullRomCurve3(points);
    // Create a mesh
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(this.path, 300, 2, 20, true),
      this.tunnelMaterial
  );
    // Add tube into the scene
    this.scene.add(tube);
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
      // Increase the percentage
      const frame = this.frames * 0.0001;
      // Get the point at the specific percentage
      const p1 = this.path.getPointAt(frame % 1);
      const p2 = this.path.getPointAt((frame + 0.01) % 1);
      // Place the camera at the point
      this.camera.position.set(p1.x, p1.y, p1.z);
      this.camera.lookAt(p2);
      this.light.position.set(p2.x, p2.y, p2.z);
    }
    this.renderScene();
    this.frames ++;
    window.requestAnimationFrame(this.renderLoop);
  };
}
