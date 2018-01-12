import Vector from './Vector';
/**
* Basic Particle Class Object
* WIP - pjkarlik@gmail.com
**/
export default class Particle {
  constructor(config) {
    this.size = config.size;
    this.ref = config.ref;
    this.life = 0;
    this.x = config.x;
    this.y = config.y;
    this.z = config.z;
    const min = config.min || 5;
    const max = config.max || 10;
    this.vx = (Math.abs(Math.random() * max) - min);
    this.vy = (Math.abs(Math.random() * max) - min);
    this.vz = (Math.abs(Math.random() * max) - min);
    
    this.settings = config.settings;
    this.box = config.box;
    this.update();
  }

  update = () => {
    const { gravity, bounce } = this.settings;
    if (this.y > this.box.top + 1) {
      this.vy *= -bounce;
      this.vx *= bounce;
      this.vz *= bounce;
      this.y = this.box.top - 1;
    }
    if (this.y < this.box.bottom - 1) {
      this.vy *= -bounce;
      this.vx *= bounce;
      this.vz *= bounce;
      this.y = this.box.bottom + 1;
    }
    if (this.x < this.box.left - 1) {
      this.vx *= -bounce;
      this.x = this.box.left + 1;
    }
    if (this.x > this.box.right + 1) {
      this.vx *= -bounce;
      this.x = this.box.right - 1;
    }
    if (this.z < this.box.left - 1) {
      this.vz *= -bounce;
      this.z = this.box.left + 1;
    }
    if (this.z > this.box.right + 1) {
      this.vz *= -bounce;
      this.z = this.box.right - 1;
    }
    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;

    this.vy -= gravity;

    this.size -= (this.life * 0.0005);
    this.life++;
  }
}
