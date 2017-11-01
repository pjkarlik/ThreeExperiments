![travis ci build](https://travis-ci.org/pjkarlik/ThreeExperiments.svg?branch=master)

# Basic Skybox

  Simple skybox implementation setting up a CubeRefractionMapping material and applying that to the scene background.

  ```
  // Skybox image imports //
  import xpos from '../../resources/images/chapel/posx.jpg';
  import xneg from '../../resources/images/chapel/negx.jpg';
  import ypos from '../../resources/images/chapel/posy.jpg';
  import yneg from '../../resources/images/chapel/negy.jpg';
  import zpos from '../../resources/images/chapel/posz.jpg';
  import zneg from '../../resources/images/chapel/negz.jpg';

  // Skybox Setup//
  const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
  const skybox = new THREE.CubeTextureLoader().load(urls);
  skybox.format = THREE.RGBFormat;
  skybox.mapping = THREE.CubeRefractionMapping;
  this.scene.background = skybox;
  ```
