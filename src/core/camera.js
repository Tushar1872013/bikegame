import * as THREE from 'three';

const MODES = ['third', 'first', 'free'];

export class FollowCamera {
  constructor(domElement) {
    this.instance = new THREE.PerspectiveCamera(65, 1, 0.1, 600);
    this.domElement = domElement;
    this.modeIndex = 0;
    this.freeYaw = 0;
    window.addEventListener('keydown', (event) => {
      if (event.code === 'KeyC') this.nextMode();
    });
  }

  get mode() {
    return MODES[this.modeIndex];
  }

  get modeName() {
    return this.mode === 'third' ? 'Third person' : this.mode === 'first' ? 'First person' : 'Free camera';
  }

  nextMode() {
    this.modeIndex = (this.modeIndex + 1) % MODES.length;
  }

  resize(aspect) {
    this.instance.aspect = aspect;
    this.instance.updateProjectionMatrix();
  }

  update(delta, bike) {
    const heading = bike.heading;
    const forward = new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading));
    const target = bike.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0));

    if (this.mode === 'first') {
      const pos = target.clone().add(forward.clone().multiplyScalar(1.2)).add(new THREE.Vector3(0, 0.35, 0));
      this.instance.position.lerp(pos, 1 - Math.exp(-16 * delta));
      this.instance.lookAt(target.clone().add(forward.clone().multiplyScalar(20)));
      return;
    }

    if (this.mode === 'free') this.freeYaw += delta * 0.35;
    const orbit = this.mode === 'free' ? this.freeYaw : heading;
    const behind = new THREE.Vector3(-Math.sin(orbit), 0, -Math.cos(orbit));
    const desired = target.clone().add(behind.multiplyScalar(9)).add(new THREE.Vector3(0, 5, 0));
    this.instance.position.lerp(desired, 1 - Math.exp(-7 * delta));
    this.instance.lookAt(target.clone().add(forward.multiplyScalar(6)));
  }
}
