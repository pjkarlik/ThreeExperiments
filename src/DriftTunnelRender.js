import THREE from './Three';

import stone from '../resources/images/matallo.jpg';
import stone2 from '../resources/images/grate.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.start = Date.now();
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
    return new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(this.makeRandomPath(points)),
          300,
          0.5,
          24,
          true
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
      texture.repeat.set(25, 3);
    });
    const texture2 = texloader.load(stone2, () => {
      texture2.wrapS = texture2.wrapT = THREE.RepeatWrapping;
      texture2.offset.set(0, 0);
      texture2.repeat.set(185, 3);
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
      [68.5, 0.0, 185.4],
      [1, 20.0, 262.5],
      [220.9, 60.0, 500.9],
      [345.5, 60.0, 212.8],
      [218.0, 100.0, 155.7],
      [240.3, 40.0, 72.3],
      [153.4, 0.0, 0.6],
      [102.6, 0.0, 153.3],
      [68.4, 0.0, 185.5]
    ];
    const points = initialPoints.map((point) => {
      const v3Point = new THREE.Vector3(...point);
      return v3Point;
    });

    // this.path2 = new THREE.CatmullRomCurve3(this.makeRandomPath(initialPoints));
    this.path1 = new THREE.CatmullRomCurve3(points);

    // Create a mesh
    const tube1 = new THREE.Mesh(
      new THREE.TubeGeometry(
        this.path1,
        300,
        26,
        24,
        true
      ),
      this.tunnelMaterial,
    );
    this.scene.add(tube1);

    // const tube2 = this.makeTube(initialPoints);
    // this.scene.add(tube2);
    // const tube3 = this.makeTube(initialPoints);
    // this.scene.add(tube3);
    for (let i = 0; i < 10; i++) {
      const tube = this.makeTube(initialPoints);
      this.scene.add(tube);
      this.tubes.push(tube);
    }

    // this.effect = new THREE.AnaglyphEffect(this.renderer);
    // this.effect.setSize(this.width, this.height);
    this.renderLoop();
  };

  makeRandomPath = (pointList) => {
    const totalPoints = pointList.length;
    const randomPoints = pointList.map((point, index) => {
      const gate = index > 0 && index < totalPoints - 1;

      const rx = 15 - Math.random() * 30;
      const ry = 15 - Math.random() * 30;

      const tx = gate ? point[0] + rx : point[0];
      const ty = gate ? point[1] + ry : point[1];
      const tz = point[2];
      const v3Point = new THREE.Vector3(tx, ty, tz);
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
    // Get stopFrame
    this.stopFrame += 0.001;
    const realTime = this.frames * 0.005;
    // Get the point at the specific percentage
    const lvc = this.isRnd ? 0.06 : -(0.06);
    const p1 = this.path1.getPointAt(Math.abs((this.stopFrame) % 1));
    const p2 = this.path1.getPointAt(Math.abs((this.stopFrame + lvc) % 1));
    const p3 = this.path1.getPointAt(Math.abs((this.stopFrame + 0.09) % 1));

    if (Math.random() * 255 > 254) {
      this.isRnd = !this.isRnd;
    }

    const amps = 30 * Math.sin(realTime + 1 * Math.PI / 180);
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
