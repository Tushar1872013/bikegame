import * as THREE from 'three';

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x95c5d6);
  scene.fog = new THREE.Fog(0x95c5d6, 80, 260);

  const hemi = new THREE.HemisphereLight(0xfff3da, 0x45614a, 1.25);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 1.8);
  sun.position.set(-45, 80, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);

  return scene;
}
