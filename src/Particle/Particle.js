import Vector from './Vector';
/**
* Basic Particle Class Object
* WIP - pjkarlik@gmail.com
**/
export default class Particle {
  constructor(config) {
    this.id = config.id;
    this.size = config.size;
    this.mass = this.size * 0.2;
    this.ref = config.ref;
    this.vector = new Vector({
      x: config.x,
      y: config.y,
      z: config.z
    });

    // this.fixed = config.fixed || false; Not used yet - trying to make static points
    this.vx = -0.001;
    this.vy = -0.7;
    this.vz = -0.001;
    this.settings = config.settings;
    this.box = config.box;
  }

  objectHit = (direction, reflect) => {
    const { bounce } = this.settings;
    if (direction === 'y') {
      this.vy *= -bounce;
      this.vx *= bounce;
      this.vector.y = reflect;
    }
    if (direction === 'x') {
      this.vy *= bounce;
      this.vx *= -bounce;
      this.vector.x = reflect;
    }
    // if (direction === 'z') {
    //   this.vz *= bounce;
    //   this.vector.z= reflect;
    // }
  }

  update = () => {
    const { gravity } = this.settings;
    if ((this.vector.y + this.size) > this.box.bottom) {
      this.objectHit('y', this.box.bottom - this.size);
    }

    if ((this.vector.x + this.size) > this.box.right) {
      this.objectHit('x', this.box.right - this.size);
    }
    if ((this.vector.x - this.size) < this.box.left) {
      this.objectHit('x', this.box.left + this.size);
    }
    // if ((this.vector.z + this.size) > this.box.right) {
    //   this.objectHit('z', this.box.left + this.size);
    // }
    // if ((this.vector.z - this.size) < this.box.left) {
    //   this.objectHit('z', this.box.left + this.size);
    // }
    this.vector.x += this.vx;
    this.vector.y += this.vy;
    // this.vector.z += this.vyz;
    this.vy += gravity;
  }
}
