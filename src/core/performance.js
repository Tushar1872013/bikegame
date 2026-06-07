/**
 * PerformanceManager
 * Handles high-precision FPS capping, adaptive resolution scaling, 
 * and smoothed metrics for the game HUD.
 */
export class PerformanceManager {
  constructor(renderer, options = {}) {
    this.renderer = renderer;
    this.targetFPS = options.targetFPS || 60;
    this.minComfortFPS = options.minComfortFPS || 55;
    this.targetFrameTime = 1000 / this.targetFPS;

    // Timing state
    this.lastFrameTime = performance.now();
    this.fpsHistory = [];
    this.historyLimit = 60; // Sample over 1 second at 60fps
    
    // Resolution/Quality state
    this.currentPixelRatio = window.devicePixelRatio;
    this.minPixelRatio = 0.5;
    this.maxPixelRatio = window.devicePixelRatio;
    
    // HUD Smoothing (Exponential Moving Average)
    this.smoothedFPS = this.targetFPS;
    this.smoothingFactor = 0.05;
  }

  /**
   * Returns true if the engine should proceed with rendering a frame.
   * Caps the output to the targetFPS.
   */
  shouldRender(currentTime) {
    const delta = currentTime - this.lastFrameTime;

    if (delta < this.targetFrameTime) {
      return false;
    }

    // Calculate actual FPS for tracking
    const currentFPS = 1000 / delta;
    this.updateMetrics(currentFPS);
    
    // Adjust lastFrameTime while accounting for the remainder to prevent drift
    this.lastFrameTime = currentTime - (delta % this.targetFrameTime);
    return true;
  }

  updateMetrics(fps) {
    // 1. Smooth the FPS for HUD display to prevent flickering numbers
    this.smoothedFPS = (this.smoothedFPS * (1 - this.smoothingFactor)) + (fps * this.smoothingFactor);

    // 2. Track history for adaptive quality decisions
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > this.historyLimit) {
      this.fpsHistory.shift();
    }

    // 3. Run adaptive resolution logic
    this.adjustQuality();
  }

  adjustQuality() {
    // Only adjust if we have a full history buffer
    if (this.fpsHistory.length < this.historyLimit) return;

    const avgFPS = this.fpsHistory.reduce((a, b) => a + b) / this.fpsHistory.length;

    // If performance is struggling, drop resolution
    if (avgFPS < this.minComfortFPS && this.currentPixelRatio > this.minPixelRatio) {
      this.currentPixelRatio = Math.max(this.minPixelRatio, this.currentPixelRatio - 0.1);
      this.renderer.setPixelRatio(this.currentPixelRatio);
      console.log(`Performance: Reducing resolution to ${this.currentPixelRatio.toFixed(2)}`);
      this.fpsHistory = []; // Clear history to allow time for change to take effect
    } 
    // If performance is very stable, try to recover resolution slowly
    else if (avgFPS >= this.targetFPS - 1 && this.currentPixelRatio < this.maxPixelRatio) {
      this.currentPixelRatio = Math.min(this.maxPixelRatio, this.currentPixelRatio + 0.01);
      this.renderer.setPixelRatio(this.currentPixelRatio);
    }
  }

  getDisplayFPS() {
    return Math.round(this.smoothedFPS);
  }

  // Compatibility wrappers for older API used in Game.update
  shouldRunFrame(timestamp) {
    return this.shouldRender(timestamp);
  }

  beginFrame(timestamp) {
    // return delta in seconds
    if (!this._prevTimeForDelta) this._prevTimeForDelta = timestamp;
    const deltaMs = timestamp - this._prevTimeForDelta;
    this._prevTimeForDelta = timestamp;
    return Math.max(0, deltaMs / 1000);
  }

  updateQuality(/* delta */) {
    this.adjustQuality();
  }

  get displayFps() {
    return this.getDisplayFPS();
  }
}