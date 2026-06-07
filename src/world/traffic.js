import * as THREE from 'three';

export class Traffic {
  constructor(scene) {
    this.scene = scene;
    this.cars = [];
    this.bodyMesh = null;
    this.cabinMesh = null;
  }

  build() {
    const colors = [0x2f80ed, 0xf2994a, 0x27ae60, 0xeb5757, 0xf2c94c];
    const count = 18;
    const bodyGeo = new THREE.BoxGeometry(1.9, 0.8, 3.5);
    const cabinGeo = new THREE.BoxGeometry(1.45, 0.55, 1.55);
    const bodyMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5 });
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0xbfd9e8, roughness: 0.25 });

    this.bodyMesh = new THREE.InstancedMesh(bodyGeo, bodyMat, count);
    this.bodyMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
    this.cabinMesh = new THREE.InstancedMesh(cabinGeo, cabinMat, count);

    const bodyMatrix = new THREE.Matrix4();
    const cabinMatrix = new THREE.Matrix4();

    for (let i = 0; i < count; i++) {
      const vertical = i % 2 === 0;
      const road = [-48, 0, 48][i % 3];
      const lane = i % 4 < 2 ? -2.7 : 2.7;
      const start = vertical ? new THREE.Vector3(road + lane, 0.45, -100 + i * 13) : new THREE.Vector3(-95 + i * 11, 0.45, road + lane);
      const rotation = vertical ? 0 : Math.PI / 2;
      const color = new THREE.Color(colors[i % colors.length]);

      bodyMatrix.makeRotationY(rotation);
      bodyMatrix.setPosition(start);
      this.bodyMesh.setMatrixAt(i, bodyMatrix);
      this.bodyMesh.setColorAt(i, color);

      cabinMatrix.makeRotationY(rotation);
      cabinMatrix.setPosition(start.clone().setY(1.05).add(new THREE.Vector3(0, 0, -0.2).applyEuler(new THREE.Euler(0, rotation, 0))));
      this.cabinMesh.setMatrixAt(i, cabinMatrix);

      this.cars.push({ position: start, vertical, speed: 8 + (i % 5), dir: i % 4 < 2 ? 1 : -1, radius: 1.8, rotation });
    }

    this.bodyMesh.instanceMatrix.needsUpdate = true;
    this.bodyMesh.instanceColor.needsUpdate = true;
    this.cabinMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.bodyMesh, this.cabinMesh);
  }

  update(delta) {
    const bodyMatrix = new THREE.Matrix4();
    const cabinMatrix = new THREE.Matrix4();

    for (let i = 0; i < this.cars.length; i++) {
      const car = this.cars[i];
      if (car.vertical) {
        car.position.z += car.speed * car.dir * delta;
        if (Math.abs(car.position.z) > 124) car.position.z *= -0.95;
      } else {
        car.position.x += car.speed * car.dir * delta;
        if (Math.abs(car.position.x) > 124) car.position.x *= -0.95;
      }

      bodyMatrix.makeRotationY(car.rotation);
      bodyMatrix.setPosition(car.position);
      this.bodyMesh.setMatrixAt(i, bodyMatrix);

      const cabinPosition = car.position.clone();
      cabinPosition.y = 1.05;
      cabinPosition.add(new THREE.Vector3(0, 0, -0.2).applyEuler(new THREE.Euler(0, car.rotation, 0)));
      cabinMatrix.makeRotationY(car.rotation);
      cabinMatrix.setPosition(cabinPosition);
      this.cabinMesh.setMatrixAt(i, cabinMatrix);
    }

    this.bodyMesh.instanceMatrix.needsUpdate = true;
    this.cabinMesh.instanceMatrix.needsUpdate = true;
  }

  resolveCollisions(bike) {
    for (const car of this.cars) {
      const dx = bike.mesh.position.x - car.position.x;
      const dz = bike.mesh.position.z - car.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance > 0 && distance < car.radius + bike.radius) bike.stopAndBounce(dx / distance, dz / distance);
    }
  }
}
