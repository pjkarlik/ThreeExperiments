import THREE from './Three';

import stone from '../resources/images/6920.jpg';
// import bmp from '../resources/images/matallo_bmp.jpg';
const bmp = stone;
// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.stopFrame = 0;
    this.allowChange = false;
    this.timeout = 6000;
    this.isRnd = true;
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
    this.scene.fog = new THREE.FogExp2(0x000000, 0.01);
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
    this.lightA = new THREE.PointLight(0x888888, 1, 550);
    this.scene.add(this.lightA);
    this.lightB = new THREE.PointLight(0x0000FF, 1, 350);
    this.scene.add(this.lightB);
    this.lightC = new THREE.PointLight(0xFF0000, 1, 350);
    this.scene.add(this.lightC);

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
    const rpt = 100;
    const texture = texloader.load(stone, () => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.offset.set(0, 0);
      texture.repeat.set(rpt, 4);
    });
    const bmpMap = texloader.load(bmp, () => {
      bmpMap.wrapS = bmpMap.wrapT = THREE.RepeatWrapping;
      bmpMap.offset.set(0, 0);
      bmpMap.repeat.set(rpt, 4);
    });

    this.tunnelMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      bumpMap: bmpMap,
      bumpScale: 0.55,
      specularMap: bmpMap,
      specular: new THREE.Color(0xAAAAFA),
      side: THREE.DoubleSide,
    });
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
    this.path = new THREE.CatmullRomCurve3(points);
    // Create a mesh
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(this.path, 100, 15, 15, true),
      this.tunnelMaterial
  );
    // Add tube into the scene
    this.scene.add(tube);

    this.effect = new THREE.AnaglyphEffect(this.renderer);
    this.effect.setSize(this.width, this.height);
    setTimeout(() => {
      this.allowChange = true;
    }, this.timeout);
    this.renderLoop();
  };

  resize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  renderScene = () => {
    // const realTime = this.frames * 0.005;
    this.stopFrame += 0.00001;
    // Get the point at the specific percentage
    const lvc = this.isRnd ? 0.01 : -(0.01);
    const p1 = this.path.getPointAt(Math.abs((this.stopFrame) % 1));
    const p2 = this.path.getPointAt(Math.abs((this.stopFrame + lvc) % 1));
    const p3 = this.path.getPointAt(Math.abs((this.stopFrame + 0.05) % 1));
    const p4 = this.path.getPointAt(Math.abs((this.stopFrame + lvc - 0.05) % 1));
    if (Math.random() * 255 > 254 && this.allowChange) {
      this.isRnd = !this.isRnd;
      this.allowChange = false;
      setTimeout(() => {
        this.allowChange = true;
      }, this.timeout);
    }

    const amps = 2; // + Math.sin(realTime * Math.PI / 180) * 45;
    const tempX = amps * Math.sin(this.frames * Math.PI / 180) * 0.45;
    const tempY = amps * Math.cos(this.frames * Math.PI / 180) * 0.45;
    // Camera
    this.camera.position.set(p1.x + tempX, p1.y + tempY, p1.z + tempY);
    this.camera.lookAt(p2);
    // Lights
    this.lightA.position.set(p2.x, p2.y, p2.z);
    this.lightB.position.set(p3.x, p3.y, p3.z);
    this.lightC.position.set(p4.x, p4.y, p4.z);
    // Core three Render call //
    this.renderer.render(this.scene, this.camera);
    // this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    window.requestAnimationFrame(this.renderLoop.bind(this));
    this.frames ++;
    this.renderScene();
  };
}
