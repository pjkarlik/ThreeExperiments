/**
* Basic Vector Class Object
* WIP - pjkarlik@gmail.com
**/
export default class Vector {
  constructor(config) {
    this.x = config.x;
    this.y = config.y;
    this.z = config.z;
  }

  add = (v) =>  {
    return {
      x: v.x ? this.x + v.x : this.x,
      y: v.y ? this.y + v.y : this.y,
      z: v.z ? this.z + v.z : this.z,
    };
  }

  subtract = (v) =>  {
    return {
      x: v.x ? this.x - v.x : this.x,
      y: v.y ? this.y - v.y : this.y,
      z: v.z ? this.z - v.z : this.z,
    };
  }

  scale = (v) =>  {
    return {
      x: v.x ? this.x * v.x : this.x,
      y: v.y ? this.y * v.y : this.y,
      z: v.z ? this.z * v.z : this.z,
    };
  }

  divide = (v) =>  {
    return {
      x: v.x ? this.x / v.x : this.x,
      y: v.y ? this.y / v.y : this.y,
      z: v.z ? this.z / v.z : this.z,
    };
  }

  square = () => {
    return {
      x: this.x * this.x,
      y: this.y * this.y,
      z: this.z * this.z,
    };
  }

  normalize = () => {
    const sqrt = 1 / this.square();
    return new Vector(this.x * sqrt, this.y * sqrt, this.z * sqrt);
  }

  mix = (v, amount) => {
    const amt = amount || 0.5;
    const mixX = v.x ? (1 - amt) * this.x + amt * v.x : this.x;
    const mixY = v.y ? (1 - amt) * this.y + amt * v.y : this.y;
    const mixZ = v.z ? (1 - amt) * this.y + amt * v.z : this.z;
    return {
      x: mixX,
      y: mixY,
      z: mixZ,
    };
  }
}
