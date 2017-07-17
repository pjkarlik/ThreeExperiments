import THREE from './Three';

import stone from '../resources/images/grate.jpg';
import bmp from '../resources/images/grate_bmp.jpg';

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
      near: 0.1,
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
    // this.scene.fog = new THREE.FogExp2(0x000000, 0.0275);
    this.camera = new THREE.PerspectiveCamera(
        this.cameraConfig.viewAngle,
        this.cameraConfig.aspect,
        this.cameraConfig.near,
        this.cameraConfig.far
    );

    this.camera.position.set(...this.cameraConfig.position);
    // this.camera.lookAt(new THREE.Vector3(...this.cameraConfig.lookAt));
    this.scene.add(this.camera);

    // Set Light //
    this.camlight = new THREE.PointLight(0xAAAAAA, 5, 80);
    this.scene.add(this.camlight);
    this.light = new THREE.PointLight(0xAAAAAA, 1, 150);
    this.scene.add(this.light);
  };

  getRandomVector = () => {
    const x = 0.0 + Math.random() * 25;
    const y = 0.0 + Math.random() * 35;
    const z = 0.0 + Math.random() * 15;
    return new THREE.Vector3(x, y, z);
  }

  createScene = () => {
    const texloader = new THREE.TextureLoader();
    /* eslint no-multi-assign: 0 */
    const texture = texloader.load(stone, () => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.offset.set(0, 0);
      texture.repeat.set(150, 4);
    });
    const bmpMap = texloader.load(bmp, () => {});
    this.tunnelMaterial = new THREE.MeshLambertMaterial({
      map: texture,
      bumpMap: bmpMap,
      bumpScale: 0.85,
      side: THREE.DoubleSide,
    });
    const initialPoints = [
      [68.5, 0.0, 185.5],
      [1, 120.0, 262.5],
      [270.9, 223.0, 281.9],
      [345.5, 100.0, 212.8],
      [178, -15.50, 155.7],
      [240.3, 540.0, 72.3],
      [153.4, -65.33, 0.6],
      [52.6, 325.0, 53.3],
      [68.5, 100.0, 185.5]
    ];
    const points = initialPoints.map((point) => {
      const v3Point = new THREE.Vector3(...point);
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

    this.effect = new THREE.AnaglyphEffect(this.renderer);
    this.effect.setSize(this.width, this.height);
  };

  resize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  renderScene = () => {
    // Core three Render call //
    // this.renderer.render(this.scene, this.camera);
    this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    if (this.frames % 1 === 0) {
      // some function here for throttling
      // Increase the percentage
      const frame = this.frames * 0.00004;
      // Get the point at the specific percentage
      const p1 = this.path.getPointAt(frame % 1);
      const p2 = this.path.getPointAt((frame + 0.01) % 1);
      // Place the camera at the point
      this.camlight.position.set(p1.x, p1.y, p1.z);
      this.camera.position.set(p1.x, p1.y, p1.z);
      this.camera.lookAt(p2);
      this.light.position.set(p2.x, p2.y, p2.z);
    }
    this.renderScene();
    this.frames ++;
    window.requestAnimationFrame(this.renderLoop);
  };
}
