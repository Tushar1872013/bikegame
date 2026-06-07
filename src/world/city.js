import * as THREE from 'three';

const BUILDING_STYLES = [
  { name: 'brick', baseColor: 0xb45132, windowColor: 0x90c8ff, roughness: 0.75, metalness: 0.05 },
  { name: 'glass', baseColor: 0x7895a1, windowColor: 0xc9f0ff, roughness: 0.18, metalness: 0.55 },
  { name: 'concrete', baseColor: 0x9a9e9f, windowColor: 0xa3c1d9, roughness: 0.85, metalness: 0.02 },
];

function createFacadeTexture(style) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = `#${style.baseColor.toString(16).padStart(6, '0')}`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (style.name === 'brick') {
    ctx.strokeStyle = '#8c3f2a';
    ctx.lineWidth = 2;
    for (let y = 0; y < canvas.height; y += 16) {
      const offset = (y / 16) % 2 === 0 ? 0 : 16;
      for (let x = -offset; x <= canvas.width; x += 24) {
        ctx.strokeRect(x, y, 24, 14);
      }
    }
  } else if (style.name === 'glass') {
    ctx.fillStyle = '#8faaab';
    for (let y = 0; y < canvas.height; y += 16) {
      for (let x = 0; x < canvas.width; x += 16) {
        ctx.fillRect(x + 2, y + 2, 12, 12);
      }
    }
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
  } else {
    ctx.fillStyle = '#b5b5b5';
    for (let y = 0; y < canvas.height; y += 18) {
      ctx.fillRect(0, y + 10, canvas.width, 6);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createBuildingLOD(height, styleIndex) {
  const style = BUILDING_STYLES[styleIndex % BUILDING_STYLES.length];
  const facadeTexture = createFacadeTexture(style);

  const highMaterial = new THREE.MeshStandardMaterial({ map: facadeTexture, roughness: style.roughness, metalness: style.metalness });
  const lowMaterial = new THREE.MeshStandardMaterial({ color: style.baseColor, roughness: style.roughness, metalness: style.metalness });

  const fullHeight = Math.max(7, height);
  const bodyGeometry = new THREE.BoxGeometry(13, fullHeight, 13);

  const detail = new THREE.Group();
  const highBody = new THREE.Mesh(bodyGeometry, highMaterial);
  highBody.castShadow = true;
  highBody.receiveShadow = true;
  detail.add(highBody);

  const windowMaterial = new THREE.MeshStandardMaterial({ color: style.windowColor, emissive: style.windowColor, emissiveIntensity: 0.04, roughness: 0.18, metalness: 0.3, side: THREE.DoubleSide });
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x372d26, roughness: 0.9, metalness: 0.05 });

  const windowGeom = new THREE.PlaneGeometry(2, 1.2);
  for (let floor = 1; floor < fullHeight / 2; floor += 1) {
    const worldY = floor * 2 - 0.6; // world-space target Y for this floor's windows
    const localY = worldY - (fullHeight / 2); // convert to LOD group local space
    for (let side = -1; side <= 1; side += 2) {
      const rowX = side * 4.8;
      for (let col = -1; col <= 1; col += 1) {
        const win = new THREE.Mesh(windowGeom, windowMaterial);
        win.position.set(rowX, localY, -6.51);
        detail.add(win);
        const win2 = win.clone();
        win2.position.set(rowX, localY, 6.51);
        win2.rotation.y = Math.PI;
        detail.add(win2);
      }
    }
    for (let col = -1; col <= 1; col += 1) {
      const win = new THREE.Mesh(windowGeom, windowMaterial);
      win.position.set(-6.51, localY, col * 4.8);
      win.rotation.y = Math.PI / 2;
      detail.add(win);
      const win2 = win.clone();
      win2.position.set(6.51, localY, col * 4.8);
      win2.rotation.y = -Math.PI / 2;
      detail.add(win2);
    }
  }

  const door = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.6, 0.25), doorMaterial);
  // door target world Y is 1.8; convert to local space so door sits at ground level correctly
  door.position.set(0, 1.8 - (fullHeight / 2), 6.51);
  detail.add(door);

  const roofBox = new THREE.Mesh(new THREE.BoxGeometry(9, 0.5, 9), new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.85 }));
  roofBox.position.set(0, fullHeight / 2 + 0.25, 0);
  detail.add(roofBox);

  const lod = new THREE.LOD();
  lod.addLevel(detail, 0);

  const midBody = new THREE.Mesh(bodyGeometry, lowMaterial);
  midBody.castShadow = true;
  midBody.receiveShadow = true;
  lod.addLevel(midBody, 85);

  const veryLowBody = new THREE.Mesh(new THREE.BoxGeometry(13, Math.max(6, fullHeight - 4), 13), lowMaterial);
  veryLowBody.castShadow = true;
  veryLowBody.receiveShadow = true;
  lod.addLevel(veryLowBody, 140);

  return lod;
}

export class City {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.lods = [];
  }

  build() {
    this.addGround();
    this.addRoads();
    this.addBuildings();
    this.addTrees();
    this.addTrafficLights();
  }

  addGround() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(280, 280), new THREE.MeshStandardMaterial({ color: 0x5d9f5d, roughness: 0.9 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  addRoads() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x34383b, roughness: 0.85 });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf4d35e });
    for (const x of [-48, 0, 48]) {
      const road = new THREE.Mesh(new THREE.BoxGeometry(12, 0.05, 260), mat);
      road.position.set(x, 0.03, 0);
      road.receiveShadow = true;
      this.scene.add(road);
      this.addLaneLines(x, true, lineMat);
    }
    for (const z of [-48, 0, 48]) {
      const road = new THREE.Mesh(new THREE.BoxGeometry(260, 0.055, 12), mat);
      road.position.set(0, 0.04, z);
      road.receiveShadow = true;
      this.scene.add(road);
      this.addLaneLines(z, false, lineMat);
    }
  }

  addLaneLines(offset, vertical, mat) {
    for (let i = -110; i <= 110; i += 14) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(vertical ? 0.22 : 5, 0.06, vertical ? 5 : 0.22), mat);
      line.position.set(vertical ? offset : i, 0.09, vertical ? i : offset);
      this.scene.add(line);
    }
  }

  addBuildings() {
    const positions = [];
    for (let x = -96; x <= 96; x += 24) {
      for (let z = -96; z <= 96; z += 24) {
        if (Math.abs(x % 48) < 8 || Math.abs(z % 48) < 8) continue;
        positions.push({ x, z });
      }
    }

    positions.forEach((pos, index) => {
      const styleIndex = Math.abs(pos.x + pos.z + index) % BUILDING_STYLES.length;
      const height = 7 + ((Math.abs(pos.x * 11 + pos.z * 7) % 11) * 1.4);
      const building = createBuildingLOD(height, styleIndex);
      building.position.set(pos.x, height / 2, pos.z);
      this.scene.add(building);
      this.lods.push(building);
      this.colliders.push({ x: pos.x, z: pos.z, r: 9 });
    });
  }

  addTrees() {
    const trunk = new THREE.CylinderGeometry(0.35, 0.5, 2.2, 8);
    const leaves = new THREE.ConeGeometry(1.9, 4, 9);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x73513a });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x236b3a });
    const trunkMesh = new THREE.InstancedMesh(trunk, trunkMat, 84);
    const leafMesh = new THREE.InstancedMesh(leaves, leafMat, 84);
    const matrix = new THREE.Matrix4();
    let index = 0;
    for (let i = -120; i <= 120; i += 20) {
      for (const side of [-1, 1]) {
        const x = side * (18 + Math.abs((i * 7) % 18));
        const z = i;
        matrix.makeTranslation(x, 1.1, z);
        trunkMesh.setMatrixAt(index, matrix);
        matrix.makeTranslation(x, 4, z);
        leafMesh.setMatrixAt(index, matrix);
        index++;
      }
    }
    trunkMesh.castShadow = true;
    leafMesh.castShadow = true;
    this.scene.add(trunkMesh, leafMesh);
  }

  addTrafficLights() {
    const group = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x202225 });
    const red = new THREE.MeshStandardMaterial({ color: 0xff2b2b, emissive: 0x550000 });
    for (const x of [-6, 6, 42, 54, -42, -54]) {
      for (const z of [-6, 6, 42, 54, -42, -54]) {
        if (Math.abs(x) !== 6 && Math.abs(z) !== 6) continue;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4), poleMat);
        pole.position.set(x, 2, z);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), red);
        lamp.position.set(x, 4.15, z);
        group.add(pole, lamp);
      }
    }
    this.scene.add(group);
  }

  update(camera) {
    this.lods.forEach((lod) => lod.update(camera));
  }

  resolveCollisions(bike) {
    for (const collider of this.colliders) {
      const dx = bike.mesh.position.x - collider.x;
      const dz = bike.mesh.position.z - collider.z;
      const distance = Math.hypot(dx, dz);
      if (distance > 0 && distance < collider.r + bike.radius) bike.stopAndBounce(dx / distance, dz / distance);
    }
  }
}
