import THREE from './Three';

import stone from '../resources/images/matallo.jpg';
import stone2 from '../resources/images/corrugated2.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.start = Date.now();
    this.stopFrame = 0.0;
    this.angle = 255.0;
    this.dec = 55.0;
    this.frames = 0;
    this.stopFrame = 0;
    this.tubes = [];
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
    window.addEventListener('keydown', this.checkMove, false);
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
    // this.scene.fog = new THREE.FogExp2(0x000000, 0.00975);
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

    this.createScene();
  };

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
      this.tunnelMaterial2,
    );
  };

  createScene = () => {
    /* eslint no-multi-assign: 0 */
    const texloader = new THREE.TextureLoader();
    const texture = texloader.load(stone, () => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.offset.set(0, 0);
      texture.repeat.set(30, 4);
    });
    const texture2 = texloader.load(stone2, () => {
      texture2.wrapS = texture2.wrapT = THREE.RepeatWrapping;
      texture2.offset.set(0, 0);
      texture2.repeat.set(500, 1);
    });
    this.tunnelMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    this.tunnelMaterial2 = new THREE.MeshPhongMaterial({
      map: texture2,
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
      // [68.5, 0.0, 185.5],
      // [1, 20.0, 262.5],
      // [220.9, 60.0, 500.9],
      // [345.5, 90.0, 212.8],
      // [218.0, 230.0, 155.7],
      // [240.3, 120.0, 72.3],
      // [153.4, 70.0, 0.6],
      // [102.6, 0.0, 153.3],
      // [68.5, 0.0, 185.5]
    ];

    const points = initialPoints.map((point) => {
      const v3Point = new THREE.Vector3(...point);
      return v3Point;
    });

    this.path1 = new THREE.CatmullRomCurve3(points);

    const tube1 = new THREE.Mesh(
      new THREE.TubeGeometry(
        this.path1,
        150,
        40,
        18,
        true
      ),
      this.tunnelMaterial,
    );
    this.scene.add(tube1);

    for (let i = 0; i < 14; i++) {
      const tube = this.makeTube(initialPoints);
      this.scene.add(tube);
      this.tubes.push(tube);
    }

    // this.effect = new THREE.AnaglyphEffect(this.renderer);
    // this.effect.setSize(this.width, this.height);
    this.renderLoop();
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

  checkMove = (e) => {
    const keyis = e.keyCode;
    if (keyis === 87) {
      this.stopFrame += 1;
    }
    if (keyis === 83) {
      this.stopFrame -= 1;
    }
  }
  renderScene = () => {
    const realTime = this.frames * 0.005;
    this.stopFrame += 0.0003;
    // Get the point at the specific percentage
    const lvc = this.isRnd ? 0.03 : -(0.03);
    const p1 = this.path1.getPointAt(Math.abs((this.stopFrame) % 1));
    const p2 = this.path1.getPointAt(Math.abs((this.stopFrame + lvc) % 1));
    const p3 = this.path1.getPointAt(Math.abs((this.stopFrame + 0.09) % 1));

    if (Math.random() * 255 > 254) {
      this.isRnd = !this.isRnd;
    }

    const amps = 30 + Math.sin(realTime + 1 * Math.PI / 180) * 30;
    const tempX = amps * Math.cos(realTime + 1 * Math.PI / 180) * 0.45;
    const tempY = amps * Math.sin(realTime + 1 * Math.PI / 180) * 0.45;
    // Camera
    this.camera.position.set(p1.x + tempX, p1.y + tempY, p1.z);
    this.camera.lookAt(p2);
    // Lights
    this.lightA.position.set(p2.x, p2.y, p2.z);
    this.lightB.position.set(p3.x, p3.y, p3.z);
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
