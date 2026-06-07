import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class AssetLoader {
  constructor(onProgress = () => {}) {
    this.onProgress = onProgress;
    this.loader = new GLTFLoader();
  }

  async loadModel(url) {
    try {
      const gltf = await this.loader.loadAsync(url, (event) => {
        if (event.lengthComputable) {
          this.onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
        }
      });
      return gltf.scene.clone(true);
    } catch (error) {
      console.warn(`AssetLoader: unable to load ${url}`, error);
      return null;
    }
  }

  async ready() {
    this.onProgress(5);
    this.onProgress(100);
    const assets = {
      bike: null,
      car: null,
      building: null,
    };
    return assets;
  }
}
