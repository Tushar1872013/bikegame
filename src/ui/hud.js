export class HUD {
  constructor() {
    this.loading = document.querySelector('#loading');
    this.loadingStatus = document.querySelector('#loading-status');
    this.money = document.querySelector('#money');
    this.time = document.querySelector('#time');
    this.fps = document.querySelector('#fps');
    this.speed = document.querySelector('#speed');
    this.pause = document.querySelector('#pause');
    this.minimap = document.querySelector('#minimap');
    this.cameraMode = document.querySelector('#camera-mode');
    this.ctx = this.minimap.getContext('2d');
  }

  setLoading(text) {
    this.loadingStatus.textContent = text;
  }

  hideLoading() {
    this.loading.classList.remove('loading');
    this.loading.classList.add('hidden');
  }

  onPause(callback) {
    this.pause.addEventListener('click', callback);
  }

  onCameraMode(callback) {
    this.cameraMode.addEventListener('click', callback);
  }

  setPaused(paused) {
    this.pause.textContent = paused ? '▶' : 'II';
  }

  render(bike, elapsed, fps, cameraMode) {
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = Math.floor(elapsed % 60).toString().padStart(2, '0');
    this.money.textContent = `Money ₹${Math.floor(elapsed * 3)}`;
    this.time.textContent = `Time ${minutes}:${seconds}`;
    this.fps.textContent = `FPS ${Math.round(fps)}`;
    this.speed.textContent = Math.abs(Math.round(bike.speed * 3.6));
    this.cameraMode.textContent = cameraMode;
    this.drawMinimap(bike);
  }

  drawMinimap(bike) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 150, 150);
    ctx.fillStyle = '#23333a';
    ctx.fillRect(0, 0, 150, 150);
    ctx.strokeStyle = '#77888e';
    ctx.lineWidth = 8;
    for (const n of [24, 75, 126]) {
      ctx.beginPath();
      ctx.moveTo(n, 0);
      ctx.lineTo(n, 150);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, n);
      ctx.lineTo(150, n);
      ctx.stroke();
    }
    ctx.fillStyle = '#e53935';
    ctx.beginPath();
    ctx.arc(75 + bike.mesh.position.x * 0.45, 75 + bike.mesh.position.z * 0.45, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}
