// Canvas Helper Class //
export default class Canvas {
  constructor(element) {
    this.element = element || document.body;
    // const cc = this.createCanvas();
    // return cc;
  }

  setViewport = (element) => {
    const canvasElement = element;
    const width = ~~(document.documentElement.clientWidth, window.innerWidth || 0);
    const height = ~~(document.documentElement.clientHeight, window.innerHeight || 0);
    this.width = width;
    this.height = height;
    canvasElement.width = width;
    canvasElement.height = height;
    const canvasObject = {
      width: this.width,
      height: this.height
    };
    return canvasObject;
  };

  createCanvas = (name) => {
    let canvasElement;
    if (document.getElementById(name)) {
      canvasElement = document.getElementById(name);
    } else {
      canvasElement = document.createElement('canvas');
      canvasElement.id = name;
    }
    this.setViewport(canvasElement);
    if (!document.getElementById(name)) {
      this.element.appendChild(canvasElement);
    }
    const context = canvasElement.getContext('2d');
    context.scale(1, 1);
    const canvasObject = {
      context,
      canvas: canvasElement,
      width: this.width,
      height: this.height
    };
    return canvasObject;
  };

}
