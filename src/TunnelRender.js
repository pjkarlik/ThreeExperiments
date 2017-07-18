import THREE from './Three';

import stone from '../resources/images/matallo.jpg';
import bmp from '../resources/images/matallo_bmp.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.devicePixelRatio = window.devicePixelRatio;
    // Configurations //
    this.cameraConfig = {
      position: [0, 0, 0],
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
    this.camera.lookAt(new THREE.Vector3(...this.cameraConfig.lookAt));
    this.scene.add(this.camera);

    // Set Light //
    this.camlight = new THREE.PointLight(0xAAAAAA, 5, 80);
    this.scene.add(this.camlight);
    this.light = new THREE.PointLight(0xAAAAAA, 1, 150);
    this.scene.add(this.light);
    this.farlight = new THREE.PointLight(0xFFFFFF, 1, 350);
    this.scene.add(this.farlight);

    this.createScene();
  };

  getRandomVector = () => {
    const x = 0.0 + Math.random() * 255;
    const y = 0.0 + Math.random() * 255;
    const z = 0.0 + Math.random() * 255;
    return new THREE.Vector3(x, y, z);
  }

  createScene = () => {
    const texloader = new THREE.TextureLoader();
    /* eslint no-multi-assign: 0 */
    const texture = texloader.load(stone, () => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.offset.set(0, 0);
      texture.repeat.set(155, 3);
    });
    const bmpMap = texloader.load(bmp, () => {
      bmpMap.wrapS = bmpMap.wrapT = THREE.RepeatWrapping;
      bmpMap.offset.set(0, 0);
      bmpMap.repeat.set(155, 3);
    });

    this.tunnelMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      bumpMap: bmpMap,
      bumpScale: 0.09,
      side: THREE.DoubleSide,
    });
    const initialPoints = [
      [68.5, 0.0, 185.5],
      [40, 50.0, 262.5],
      [170.9, 100.0, 281.9],
      [300, 120.0, 212.8],
      [178, 20.0, 155.7],
      [240.3, 150.0, 82.3],
      [153.4, 70.0, 20.6],
      [52.6, 20.0, 53.3],
      [68.5, 0.0, 185.5]
    ];
    const points = initialPoints.map((point) => {
      const v3Point = new THREE.Vector3(...point);
      return v3Point;
    });
    this.path = new THREE.CatmullRomCurve3(points);
    // Create a mesh
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(this.path, 100, 1.5, 15, true),
      this.tunnelMaterial
  );
    // Add tube into the scene
    this.scene.add(tube);

    this.effect = new THREE.AnaglyphEffect(this.renderer);
    this.effect.setSize(this.width, this.height);
    this.renderLoop();
  };

  resize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  renderScene = () => {
    // set Frame
    const frame = this.frames * 0.00001;
    // Get the point at the specific percentage
    const p1 = this.path.getPointAt(frame % 1);
    const p2 = this.path.getPointAt((frame + 0.001) % 1);
    // Place objects on path
    this.camlight.position.set(p1.x, p1.y, p1.z);
    this.camera.position.set(p1.x, p1.y, p1.z);
    this.camera.lookAt(p2);
    this.light.position.set(p2.x, p2.y, p2.z);
    // Core three Render call //
    // this.renderer.render(this.scene, this.camera);
    this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.frames ++;
    this.renderScene();
    window.requestAnimationFrame(this.renderLoop);
  };
}
