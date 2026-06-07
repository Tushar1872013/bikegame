import { createScene } from './scene.js';
import { createRenderer } from './renderer.js';
import { FollowCamera } from './camera.js';
import { PerformanceManager } from './performance.js';
import { Bike } from '../player/bike.js';
import { Controls } from '../player/controls.js';
import { PhysicsWorld } from '../player/physics.js';
import { City } from '../world/city.js';
import { Traffic } from '../world/traffic.js';
import { HUD } from '../ui/hud.js';
import { Menu } from '../ui/menu.js';
import { AssetLoader } from '../utils/loader.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = createScene();
    this.renderer = createRenderer(canvas);
    this.performance = new PerformanceManager(this.renderer);
    this.physics = new PhysicsWorld();
    this.hud = new HUD();
    this.menu = new Menu();
    this.loader = new AssetLoader((percent) => this.menu.setLoading(`Loading assets ${percent}%`));
    this.camera = new FollowCamera(this.renderer.domElement);
    this.controls = new Controls();
    this.city = new City(this.scene);
    this.traffic = new Traffic(this.scene);
    this.bike = null;
    this.elapsed = 0;
    this.paused = false;
    this.started = false;

    this.menu.onStart(() => this.startGame());
  }

  async start() {
    await this.load();
    window.addEventListener('resize', () => this.resize());
    this.hud.onPause(() => this.togglePause());
    this.hud.onCameraMode(() => this.camera.nextMode());
    this.resize();
    this.menu.showStartScreen();
  }

  startGame() {
    if (this.started) return;
    this.started = true;
    this.menu.hideStartScreen();
    this.renderer.setAnimationLoop((timestamp) => this.update(timestamp));
  }

  async load() {
    this.hud.setLoading('Loading assets 0%');
    const assets = await this.loader.ready();
    this.city.build(assets);
    this.traffic.build(assets);
    this.bike = new Bike(this.scene, this.physics, assets);
    // Diagnostic: log scene and asset info to help debugging invisible scene issues
    // (Will appear in the browser console)
    try {
      // eslint-disable-next-line no-console
      console.log('Game.load: assets', assets);
      // eslint-disable-next-line no-console
      console.log('Game.load: scene children', this.scene.children.length);
      // eslint-disable-next-line no-console
      console.log('Game.load: bike position', this.bike && this.bike.mesh ? this.bike.mesh.position : null);
    } catch (e) {
      // ignore logging errors
    }

    // Ensure camera has a sensible fallback position so the world is visible
    if (this.camera && this.camera.instance) {
      this.camera.instance.position.set(0, 12, 18);
      this.camera.instance.lookAt(0, 2, 0);
    }

    this.hud.setLoading('Ready!');
    // Brief delay to allow the user to see "Ready!" before transition
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.hud.hideLoading();
  }

  update(timestamp) {
    if (!this.performance.shouldRunFrame(timestamp)) return;
    const delta = this.performance.beginFrame(timestamp);

    if (this.paused) {
      this.hud.render(this.bike, this.elapsed, this.performance.displayFps, this.camera.modeName);
      this.renderer.render(this.scene, this.camera.instance);
      return;
    }

    this.elapsed += delta;
    const input = this.controls.read();
    this.bike.update(delta, input);
    this.traffic.update(delta);
    this.physics.step(delta);
    this.city.resolveCollisions(this.bike);
    this.traffic.resolveCollisions(this.bike);
    this.camera.update(delta, this.bike);
    this.city.update(this.camera.instance);
    this.performance.updateQuality(delta);
    this.hud.render(this.bike, this.elapsed, this.performance.displayFps, this.camera.modeName);
    this.renderer.render(this.scene, this.camera.instance);
  }

  togglePause() {
    this.paused = !this.paused;
    this.hud.setPaused(this.paused);
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.camera.resize(width / height);
  }
}
