import THREE from '../Three';

// Skybox image imports //
import xpos from '../../resources/images/space/posx.jpg';
import xneg from '../../resources/images/space/negx.jpg';
import ypos from '../../resources/images/space/posy.jpg';
import yneg from '../../resources/images/space/negy.jpg';
import zpos from '../../resources/images/space/posz.jpg';
import zneg from '../../resources/images/space/negz.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.controls = undefined;
    this.scene = undefined;
    this.camera = undefined;
    this.render = undefined;

    this.cameraPos = {
      x: 24, y: 8, z: -10
    };
    this.cameraTrg = {
      x: 0, y: 0, z: 0
    };
    this.lightPos = {
      x: 5, y: 5, z: 20
    };
    this.setViewport();

    window.addEventListener('resize', this.resize, true);
    
    this.setRender();
    this.createRoom();
    this.renderLoop();
  }

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

  setRender = () => {
    // Set Initial Render Stuff //
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      this.viewAngle,
      this.aspect,
      this.near,
      this.far
    );

    this.camera.position.set(this.cameraPos.x, this.cameraPos.y, this.cameraPos.z);
    this.camera.lookAt(new THREE.Vector3());

    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.maxDistance = 1500;
    this.controls.minDistance = 0;

    // Skybox //
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    const skybox = new THREE.CubeTextureLoader().load(urls);
    skybox.format = THREE.RGBFormat;
    this.scene.background = skybox;
  };

  createRoom = () => {
    const ambient = new THREE.AmbientLight( 0xffffff, 0.1 );
    this.scene.add( ambient );

    const spotLight = new THREE.SpotLight( 0xffffff, 1 );
    spotLight.position.set( 2, 20, 2 );
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.05;
    spotLight.decay = 2;
    spotLight.distance = 100;

    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 10;
    spotLight.shadow.camera.far = 200;
    this.scene.add( spotLight );

    const lightHelper = new THREE.SpotLightHelper( spotLight );
    this.scene.add( lightHelper );

    const material = new THREE.MeshPhongMaterial( { color: 0x808080, dithering: true } );

    const geometry = new THREE.PlaneBufferGeometry( 2000, 2000 );

    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( 0, - 1, 0 );
    mesh.rotation.x = - Math.PI * 0.5;
    mesh.receiveShadow = true;
    this.scene.add( mesh );

    const material2 = new THREE.MeshPhongMaterial( { color: 0x4080ff, dithering: true } );

    const geometry2 = new THREE.BoxBufferGeometry( 3, 1, 2 );

    const mesh2 = new THREE.Mesh( geometry2, material2 );
    mesh2.position.set( 10, 2, 0 );
    mesh2.castShadow = true;
    this.scene.add( mesh2 );

  };

  renderLoop = () => {
    this.frames ++;
    this.renderer.render(this.scene, this.camera);
    this.animation = window.requestAnimationFrame(this.renderLoop);
  };
}
