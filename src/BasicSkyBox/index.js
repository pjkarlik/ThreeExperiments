import THREE from '../Three';

// Skybox image imports //
import xpos from '../../resources/images/chapel/posx.jpg';
import xneg from '../../resources/images/chapel/negx.jpg';
import ypos from '../../resources/images/chapel/posy.jpg';
import yneg from '../../resources/images/chapel/negy.jpg';
import zpos from '../../resources/images/chapel/posz.jpg';
import zneg from '../../resources/images/chapel/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.controls = undefined;
    this.scene = undefined;
    this.camera = undefined;
    this.render = undefined;

    window.addEventListener('resize', this.resize, true);
    this.setViewport();
    this.setRender();
    this.renderLoop();
  }

  setRender = () => {
    // Set Initial Render Stuff //
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    // this.renderer.setPixelRatio(this.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
        this.viewAngle,
        this.aspect,
        this.near,
        this.far
    );
    this.camera.position.set(0, 1, -3);
    this.camera.lookAt(new THREE.Vector3());

    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxDistance = 1500;
    this.controls.minDistance = 0;

    // Set AmbientLight //
    this.ambient = new THREE.AmbientLight(0xFFFFFF);
    this.ambient.position.set(0, 0, 0);
    this.scene.add(this.ambient);

    // Skybox //
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    const skybox = new THREE.CubeTextureLoader().load(urls);
    skybox.format = THREE.RGBFormat;
    skybox.mapping = THREE.CubeRefractionMapping;
    this.scene.background = skybox;
  };

  setViewport = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.viewAngle = 60;
    this.aspect = this.width / this.height;
    this.near = 1;
    this.far = 1000;
    this.devicePixelRatio = window.devicePixelRatio;
  };

  resize = () => {
    this.setViewport();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  renderLoop = () => {
    this.frames ++;
    this.renderer.render(this.scene, this.camera);
    this.animation = window.requestAnimationFrame(this.renderLoop);
  };
}
