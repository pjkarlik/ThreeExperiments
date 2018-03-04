const CameraLoop = (lookAtVector) => {
  const damp = 0.008;
  this.camPosition.x = this.camPosition.x - (this.camPosition.x - this.trsPosition.x) * damp;
  this.camPosition.y = this.camPosition.y - (this.camPosition.y - this.trsPosition.y) * damp;
  this.camPosition.z = this.camPosition.z - (this.camPosition.z - this.trsPosition.z) * 0.006;

  this.camera.position.set(
    this.camPosition.x,
    this.camPosition.y,
    this.camPosition.z
  );
  this.camera.lookAt(lookAtVector);

  if(!this.camTimeoutx && Math.random() * 260 > 200) {
    const tempRand = 100 + Math.random() * 1000;
    this.trsPosition.x = Math.random() * 255 > 200 ?
      Math.random() * 250 > 100 ? -(tempRand) : tempRand : 0;
    this.camTimeoutx = true;
    setTimeout(
      () => { this.camTimeoutx = false; },
      6000 + (1000 * Math.random() * 20)
    );
  }
  if(!this.camTimeouty && Math.random() * 260 > 200) {
    const tempRand = 100 + Math.random() * 500;
    this.trsPosition.y = Math.random() * 255 > 200 ?
      Math.random() * 250 > 100 ? tempRand : -(tempRand * 3) : 0;
    this.camTimeouty = true;
    setTimeout(
      () => { this.camTimeouty = false; },
      6000 + (1000 * Math.random() * 20)
    );
  }
  if(!this.camTimeoutz && Math.random() * 255 > 225) {
    const tempRand = 400 + (25 * Math.random() * 20);
    this.trsPosition.z = Math.random() * 200 > 100 ? tempRand * 4 : -(tempRand);
    this.camTimeoutz = true;
    setTimeout(
      () => { this.camTimeoutz = false; },
      18000 + (1000 * Math.random() * 7)
    );
  }
};

export default CameraLoop;