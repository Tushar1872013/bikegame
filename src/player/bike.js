import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Bike {
  constructor(scene, physics, assets = {}) {
    this.scene = scene;
    this.physics = physics;
    this.speed = 0;
    this.heading = 0;
    this.radius = 1.35;
    this.mesh = new THREE.Group();
    this.mesh.position.set(0, 0.65, 4);
    scene.add(this.mesh);

    this.createMesh(assets.bike);
    this.createPhysics(physics);
    this.euler = new THREE.Euler();
  }

  createMesh(asset) {
    if (asset) {
      const model = asset.clone(true);
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      model.scale.setScalar(0.7);
      this.mesh.add(model);
      return;
    }

    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.45, 2.25), new THREE.MeshStandardMaterial({ color: 0xd32929, roughness: 0.45 }));
    body.castShadow = true;
    body.position.y = 0.55;
    group.add(body);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.22, 0.95), new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.8 }));
    seat.position.set(0, 0.88, -0.18);
    seat.castShadow = true;
    group.add(seat);

    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.18, 24);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.7 });
    for (const z of [-0.9, 0.9]) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(0, 0.28, z);
      wheel.castShadow = true;
      group.add(wheel);
    }

    const handle = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0x202428 }));
    handle.position.set(0, 1.02, 0.88);
    handle.castShadow = true;
    group.add(handle);
    this.mesh.add(group);
  }

  createPhysics(physics) {
    const chassisShape = new CANNON.Box(new CANNON.Vec3(1.2, 0.45, 1.6));
    this.body = new CANNON.Body({ mass: 160 });
    this.body.addShape(chassisShape);
    this.body.position.set(0, 1.2, 4);
    this.body.angularDamping = 0.8;
    this.body.linearDamping = 0.35;
    physics.world.addBody(this.body);

    this.vehicle = new CANNON.RaycastVehicle({
      chassisBody: this.body,
      indexRightAxis: 0,
      indexUpAxis: 1,
      indexForwardAxis: 2,
    });

    const wheelOptions = {
      radius: 0.37,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      suspensionStiffness: 28,
      suspensionRestLength: 0.26,
      maxSuspensionForce: 1000,
      dampingRelaxation: 2.5,
      dampingCompression: 4.4,
      frictionSlip: 4.5,
      rollInfluence: 0.01,
    };

    const axle = 0.85;
    const forward = 1.05;
    const wheelPositions = [
      new CANNON.Vec3(-axle, -0.1, forward),
      new CANNON.Vec3(axle, -0.1, forward),
      new CANNON.Vec3(-axle, -0.1, -forward),
      new CANNON.Vec3(axle, -0.1, -forward),
    ];

    for (const position of wheelPositions) {
      this.vehicle.addWheel({
        ...wheelOptions,
        chassisConnectionPointLocal: position,
      });
    }

    this.vehicle.addToWorld(physics.world);
  }

  update(delta, input) {
    const engineForce = input.throttle * (input.nitro ? 1600 : 900);
    const brakeForce = input.brake ? 240 : 0;

    this.vehicle.applyEngineForce(engineForce, 2);
    this.vehicle.applyEngineForce(engineForce, 3);
    this.vehicle.setBrake(brakeForce, 0);
    this.vehicle.setBrake(brakeForce, 1);
    this.vehicle.setSteeringValue(input.steer * 0.35, 0);
    this.vehicle.setSteeringValue(input.steer * 0.35, 1);

    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
    this.euler.setFromQuaternion(this.mesh.quaternion, 'YXZ');
    this.heading = this.euler.y;
    this.speed = this.body.velocity.length();
  }

  stopAndBounce(normalX, normalZ) {
    if (!this.body) return;
    this.body.position.x += normalX * 0.65;
    this.body.position.z += normalZ * 0.65;
    this.body.velocity.x *= -0.15;
    this.body.velocity.z *= -0.15;
  }
}
