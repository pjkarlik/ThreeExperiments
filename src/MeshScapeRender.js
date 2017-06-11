import THREE from './Three';
import { Generator } from './SimplexNoise';
import dat from 'dat-gui';


// Render Class Object //
export default class Render {
  constructor() {
    this.viewAngle = 55;
    this.near = 1;
    this.far = 10000;
    this.amount = 55;
    this.size = 1750;
    this.strength = 45;
    this.iteration = 0.15;
    this.spacing = this.size / this.amount;
    this.timer = 0;
    this.time = 0;
    this.frame = 0;
    this.background = 0x999999;
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
      strength: 65,
      iteration: 50,
    };
    this.gui = new dat.GUI();

    const folderRender = this.gui.addFolder('Wave Options');
    folderRender.add(this.options, 'strength', 1, 100).step(1)
      .onFinishChange((value) => { this.strength = value; });
    folderRender.add(this.options, 'iteration', 1, 100).step(1)
      .onFinishChange((value) => { this.iteration = value * 0.002; });
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
    // Set AmbientLight //
    this.ambient = new THREE.AmbientLight(0x999999);
    this.ambient.position.set(0, 0, 0);
    this.scene.add(this.ambient);

    this.spotLight = new THREE.DirectionalLight(0x0666666);
    this.spotLight.position.set(0, 10, 0);
    this.spotLight.castShadow = true;
    this.scene.add(this.spotLight);

    const skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
    const skyBoxMaterial = new THREE.MeshBasicMaterial({ color: this.background, side: THREE.BackSide });
    this.lowSkybox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    this.scene.add(this.lowSkybox);

    const meshMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      wireframe: true,
    });
    meshMaterial.wrapS = meshMaterial.wrapT = THREE.RepeatWrapping;
    this.geometry = new THREE.PlaneBufferGeometry(this.size, this.size, this.amount, this.amount);
    this.planeMesh = new THREE.Mesh(
      this.geometry,
      meshMaterial
    );

    this.planeMesh.rotation.set(90 * Math.PI / 180, 0, 0);
    this.planeMesh.position.set(0, 0, 0);
    this.scene.add(this.planeMesh);

    this.effect = new THREE.AnaglyphEffect(this.renderer);
    this.effect.setSize(this.width, this.height);
  };

  camearAnimation = () => {
    const ht = this.generator.simplex3(
      Math.abs(((this.size / 2) - this.camera.position.x) / this.amount),
      Math.abs(((this.size / 2) - this.camera.position.z) / this.amount) + this.timeStop,
      0,
    );

    this.camera.position.y = 225 + Math.sin(this.timer + Math.PI / 180) * 150
      + (ht * (this.strength / 2));
    this.camera.position.x = Math.sin(this.timer + Math.PI / 180) * 120;
    this.camera.lookAt(this.scene.position);
  };

  checkObjects = () => {
    this.timer += 0.005;
    this.time += 0.1;
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
    this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.camearAnimation();
    this.checkObjects();
    this.renderScene();
    window.requestAnimationFrame(this.renderLoop);
  };
}
