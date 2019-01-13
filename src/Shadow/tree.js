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
    this.amount = 20;
    this.size = 50;
    this.strength = 1.25;
    this.iteration = 0.35;
    this.spacing = this.size / this.amount;

    this.frames = 0;
    this.controls = undefined;
    this.scene = undefined;
    this.camera = undefined;
    this.render = undefined;
    this.treeSet = [];
    this.cameraPos = {
      x: 0, y: 37, z: -50
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

    // Skybox //
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    const skybox = new THREE.CubeTextureLoader().load(urls);
    skybox.format = THREE.RGBFormat;
    this.scene.background = skybox;
  };

  createRoom = () => {
    const texloader = new THREE.TextureLoader();
    this.ambient = new THREE.AmbientLight( 0xaaaaaa, 1);
    this.ambient.position.set( 0, 20, 0 );
    this.scene.add( this.ambient );

    this.spotLight = new THREE.SpotLight( 0xffffff, 1 );
    this.spotLight.position.set( 0, 40, 0 );
    this.spotLight.angle = Math.PI / 3;
    this.spotLight.penumbra = 0.05;
    this.spotLight.decay = 2;
    this.spotLight.distance = 100;

    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;
    this.spotLight.shadow.camera.near = 10;
    this.spotLight.shadow.camera.far = 100;
    this.scene.add( this.spotLight );

    // this.lightHelper = new THREE.SpotLightHelper( this.spotLight );
    // this.scene.add( this.lightHelper );
    // let texture = texloader.load(stone, () => {
    //   texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    //   texture.offset.set(0, 0);
    //   texture.repeat.set(6, 6);
    // });

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

    for(let i = 0; i < 10; i ++) {
      this.makeTree();
    }

    // this.makeSnowman();
  };

  makeGround = () => {

    this.geometry = new THREE.PlaneBufferGeometry(this.size, this.size, this.amount, this.amount);

    const mesh = new THREE.Mesh( 
      this.geometry, 
      new THREE.MeshPhongMaterial({ 
        color: 0xFFFFFF,
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
        // vertices[vy + vx + 0] = (-offset) + x * this.spacing;
        // vertices[vy + vx + 1] = ((-offset) + y * this.spacing);
        vertices[vy + vx + 2] = (noiseX * this.strength);
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();
  };

  makeTree = () => {
    const position = {
      x: 20 - (Math.random() * 40),
      y: 20 - (Math.random() * 40),
      z: 0
    };

    const tree_material = new THREE.MeshPhongMaterial({ 
      color: 0x00aa33,
      dithering: true,
      flatShading: true
    });
    const base_material = new THREE.MeshPhongMaterial({ 
      color: 0x5d2700,
      dithering: true,
      flatShading: true
    });

    const height = 4.5 + Math.random() * 8.5;
    const radius = 1.5 + Math.random() * 1.5;
    const treeObject = new THREE.Object3D();
    const tree_geometry = new THREE.ConeBufferGeometry(radius, height, 5);
    const base_geometry = new THREE.CylinderGeometry( radius / 4, radius / 4, 3, 6 );

    const tree = new THREE.Mesh( tree_geometry, tree_material );
    const base = new THREE.Mesh( base_geometry, base_material );

    tree.position.set( position.x, position.z + (height/2.15) + 1, position.y );
    tree.receiveShadow = true;
    tree.castShadow = true;
 
    base.position.set( position.x, position.z, position.y );
    base.receiveShadow = true;
    base.castShadow = true;

    treeObject.add(tree);
    treeObject.add(base);

    this.scene.add(treeObject);
    this.treeSet.push({
      id: this.treeSet.length,
      tree: treeObject,
      position
    });
  };

  makeSnowman = () => {
    const position = {
      x: 5 - (Math.random() * 10),
      y: 5 - (Math.random() * 10),
      z: 0
    };

    const snow_material = new THREE.MeshPhongMaterial({ 
      color: 0xaeaeae,
      dithering: true,
      flatShading: true
    });
    const cole_material = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      dithering: true,
      flatShading: true
    });

    let radius = 1.5 + Math.random() * 1.5;
    const snowmanObject = new THREE.Object3D();

    const baseBody = new THREE.Mesh( 
      new THREE.SphereBufferGeometry(radius, 6, 6),
      snow_material
    );
    baseBody.position.set( position.x, position.z + (radius / 1.5), position.y );
    baseBody.receiveShadow = true;
    baseBody.castShadow = true;

    snowmanObject.add(baseBody);
    
    let radiusChest = radius * .65;

    const baseChest = new THREE.Mesh( 
      new THREE.SphereBufferGeometry(radiusChest, 6, 6),
      snow_material
    );
    baseChest.position.set( position.x, position.z + (radius * 2), position.y );
    baseChest.receiveShadow = true;
    baseChest.castShadow = true;

    snowmanObject.add(baseChest);

    let radiusHead = radiusChest * .65;

    const baseHead = new THREE.Mesh( 
      new THREE.SphereBufferGeometry(radiusHead, 6, 6),
      snow_material
    );
    baseHead.position.set( position.x, position.z + (radius * 2.75), position.y );
    baseHead.receiveShadow = true;
    baseHead.castShadow = true;

    snowmanObject.add(baseHead);

    this.scene.add(snowmanObject);

  };

  moveLight = () => {
    const x = 9 * Math.sin(this.frames * Math.PI / 180);
    const y = 11 * Math.cos(this.frames * Math.PI / 180);
    this.sun.position.set( 2 + x, 20, 2 + y);
    this.spotLight.position.set( 2 + x, 20, 2 + y);
    this.spotLight.lookAt(0, 0, 0);
    // this.lightHelper.update();
  };

  renderLoop = () => {
    this.frames += 0.1;
    this.moveLight();
    // this.groundNoise();
    this.renderer.render(this.scene, this.camera);
    this.animation = window.requestAnimationFrame(this.renderLoop);
  };
}
