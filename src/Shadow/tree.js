import THREE from '../Three';

// Skybox image imports //
import xpos from '../../resources/images/sky/posx.jpg';
import xneg from '../../resources/images/sky/negx.jpg';
import ypos from '../../resources/images/sky/posy.jpg';
import yneg from '../../resources/images/sky/negy.jpg';
import zpos from '../../resources/images/sky/posz.jpg';
import zneg from '../../resources/images/sky/negz.jpg';


import { Generator } from '../utils/SimplexGenerator';

// Render Class Object //
export default class Render {
  constructor() {
    this.generator = new Generator(10);
    this.amount = 25;
    this.size = 50;
    this.strength = 2.25;
    this.iteration = 0.05;
    this.spacing = this.size / this.amount;
    this.background = 0xaaaaaa;
    this.frames = 0;
    this.controls = undefined;
    this.scene = undefined;
    this.camera = undefined;
    this.render = undefined;
    this.treeSet = [];
    this.cameraPos = {
      // x: 0, y: -0.1, z: -5
      // x: 4.78, y: 6.16, z: -12.5
      x: -28, y: 27, z: 32
      // x: -3.41, y: 19.39, z: 3.5
    };
    this.cameraTrg = {
      x: 0, y: 0, z: 0
    };
    this.lightPos = {
      x: 5, y: 5, z: 20
    };
    this.setViewport();

    window.addEventListener('resize', this.resize, true);
    window.addEventListener('click', this.stats, true);

    this.setRender();
    this.createRoom();
    this.renderLoop();
  }

  stats = () => {
    console.log(this.camera.position);
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

    // this.scene.fog = new THREE.FogExp2(this.background, 0.1);
    // this.scene.background = new THREE.Color(this.background);

    // Skybox //
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    const skybox = new THREE.CubeTextureLoader().load(urls);
    skybox.format = THREE.RGBFormat;
    this.scene.background = skybox;
  };

  createRoom = () => {
    this.ambient = new THREE.AmbientLight( 0xaaaaaa, 1);
    this.ambient.position.set( 0, 20, 0 );
    this.scene.add( this.ambient );

    this.spotLight = new THREE.SpotLight( 0xffffff, 1 );
    this.spotLight.position.set( 0, 40, 0 );
    this.spotLight.angle = Math.PI / 3;
    this.spotLight.penumbra = 0.05;
    this.spotLight.decay = 0;
    this.spotLight.distance = 200;
    this.mapSize = [1024, 2048, 4106, 8212];
    this.mapLevel = 3;
    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width = this.mapSize[this.mapLevel];
    this.spotLight.shadow.mapSize.height = this.mapSize[this.mapLevel];
    this.spotLight.shadow.camera.near = 1;
    this.spotLight.shadow.camera.far = 100;
    this.scene.add( this.spotLight );

    this.sun = new THREE.Mesh( 
      new THREE.SphereBufferGeometry(2, 6, 6),
      new THREE.MeshPhongMaterial({ 
        color: 0xFFFF00,
        dithering: true,
        flatShading: true,
      })
    );

    this.scene.add(this.sun);

    this.makeGround();
    this.makeTrees(50);
  };

  makeGround = () => {

    this.geometry = new THREE.PlaneBufferGeometry(this.size, this.size, this.amount, this.amount);

    const mesh = new THREE.Mesh( 
      this.geometry, 
      new THREE.MeshPhongMaterial({ 
        color: 0xeeeeee,
        specular: 0xffffff,
        dithering: true,
        flatShading: true,
        side: THREE.DoubleSide
      } ) 
    );

    mesh.rotation.set(90 * Math.PI / 180, 0, 0);
    mesh.position.set(0, -1, 0);
    mesh.receiveShadow = true;
    this.scene.add( mesh );
    this.groundNoise();
  };

  groundNoise = () => {
    const offset = this.size / 2;
    const vertices = this.geometry.attributes.position.array;
    for (let y = 0; y < this.amount + 1; y++) {
      for (let x = 0; x < this.amount + 1; x++) {
        const vx = x * 3;
        const vy = y * ((this.amount + 1) * 3);
        const noiseX = this.generator.simplex3(
          x * this.iteration,
          y * this.iteration,
          this.frames,
        );
        vertices[vy + vx + 0] = (-offset) + x * this.spacing;
        vertices[vy + vx + 1] = ((-offset) + y * this.spacing);
        vertices[vy + vx + 2] = (noiseX * this.strength);
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();
  };

  getRandomPostion = () => {
    const spatial = this.size * 0.85;
    return {
      x: (spatial / 2) - (Math.random() * spatial),
      y: (spatial / 2) - (Math.random() * spatial),
      z: 0
    };
    
  };

  checkPosition = (position, radius) => {
    if (this.treeSet.length < 0 ) return true;

    for (let i = 0; i < this.treeSet.length; i++) {
      let tree = this.treeSet[i].pos;
      let rds = (this.treeSet[i].radius * 2);

      let xf = position.x < (tree.x + rds) && position.x > (tree.x - rds);

      let yf = position.y < (tree.y + rds) && position.y > (tree.y - rds);

      // console.log(position.x, tree.x, xf);
      // console.log(position.y, tree.y, yf);
      // console.log('-----------------');
      if(xf && yf) { 
        console.log('false');
        return false;
      } 
    }
    return true;
  };

  makeTrees = (amount) => {
    for(let i = 0; i < amount; i ++) {
      let position;
      let check = false;
      let color = 0x00aa33;
      const height = 2.5 + Math.random() * 4.5;
      const radius = 0.5 + Math.random() * 1.0;

      while(!check) {
        position = this.getRandomPostion();
        check = this.checkPosition(position, radius);
      }

      const tree_material = new THREE.MeshPhongMaterial({ 
        color: color,
        dithering: true,
        flatShading: true
      });
      
      const base_material = new THREE.MeshPhongMaterial({ 
        color: 0x5d2700,
        dithering: true,
        flatShading: true
      });

      const treeObject = new THREE.Object3D();
      const tree_geometry = new THREE.ConeBufferGeometry(radius, height, 5);
      const base_geometry = new THREE.CylinderGeometry( radius / 4, radius / 4, 3, 6 );
      // const base_geometry = new THREE.BoxGeometry( radius, radius * 4 , radius);
      const tree = new THREE.Mesh( tree_geometry, tree_material );
      const base = new THREE.Mesh( base_geometry, base_material );

      tree.position.set(0, (height/2.15) + 1, 0);
      tree.receiveShadow = true;
      tree.castShadow = true;
  
      base.position.set(0, 0, 0);
      base.receiveShadow = true;
      base.castShadow = true;

      treeObject.add(tree);
      treeObject.add(base);

      const noiseX = this.generator.simplex3(
        Math.abs(this.size / position.x) * this.iteration,
        Math.abs(this.size / position.y) * this.iteration,
        this.frames,
      );

      treeObject.position.set( position.x, (noiseX * this.strength), position.y );
      this.scene.add(treeObject);
      this.treeSet.push({
        pos: {
          x: position.x,
          y: position.y,
          z: position.z 
        },
        radius: radius,
        tree: treeObject
      });
    }
  };

  treeNoise = () => {
    for (let i = 0; i < this.treeSet.length; i ++) {
      let tree = this.treeSet[i];
      const noiseX = this.generator.simplex3(
        Math.abs(this.size / tree.pos.x) * this.iteration,
        Math.abs(this.size / tree.pos.y) * this.iteration,
        this.frames,
      );

      tree.tree.position.set(tree.pos.x, (noiseX * this.strength),tree.pos.y);
    }
  };

  moveLight = () => {
    let frames = this.frames;
    const x = 25 * Math.sin(frames * Math.PI / 180);
    const y = 25 * Math.cos(frames * Math.PI / 180);
    this.sun.position.set( 2 + x, 20, 2 + y);
    this.spotLight.position.set( 2 + x, 20, 2 + y);
    this.spotLight.lookAt(0, 0, 0);
    // this.lightHelper.update();
  };

  renderLoop = () => {
    this.frames += 0.01;
    this.moveLight();
    // this.groundNoise();
    // this.treeNoise();
    this.renderer.render(this.scene, this.camera);
    this.animation = window.requestAnimationFrame(this.renderLoop);
  };
}
