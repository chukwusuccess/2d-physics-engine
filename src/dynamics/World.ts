import { RigidBody } from '../body/RigidBody';
import { Vector2 } from '../math/Vector2';
import { Narrowphase } from '../collision/Narrowphase';
import { ImpulseSolver } from './ImpulseSolver';
import { CollisionManifold } from '../collision/CollisionManifold';

export class World {
  public bodies: RigidBody[] = [];
  public gravity: Vector2 = new Vector2(0, 9.81 * 50); // Scale gravity for pixels
  public iterations: number = 6;
  public manifolds: CollisionManifold[] = [];

  constructor(gravity?: Vector2) {
    if (gravity) {
      this.gravity = gravity;
    }
  }

  addBody(body: RigidBody): void {
    this.bodies.push(body);
  }

  removeBody(body: RigidBody): void {
    const index = this.bodies.indexOf(body);
    if (index !== -1) {
      this.bodies.splice(index, 1);
    }
  }

  clear(): void {
    this.bodies = [];
    this.manifolds = [];
  }

  step(dt: number): void {
    // 1. Apply gravity and forces to integrate linear and angular velocity
    for (const body of this.bodies) {
      if (body.isStatic) continue;

      // Apply gravity
      body.applyForce(this.gravity.scale(body.mass));

      // Acceleration = Force / mass
      const acceleration = body.force.scale(body.invMass);
      body.velocity = body.velocity.add(acceleration.scale(dt));
      
      // Angular acceleration = Torque / inertia
      const angularAcceleration = body.torque * body.invInertia;
      body.angularVelocity += angularAcceleration * dt;

      // Clear forces
      body.force = Vector2.zero();
      body.torque = 0;
    }

    // 2. Detect collisions
    this.manifolds = [];
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const bodyA = this.bodies[i];
        const bodyB = this.bodies[j];

        if (bodyA.isStatic && bodyB.isStatic) continue;

        const manifold = Narrowphase.detectCollision(bodyA, bodyB);
        if (manifold) {
          this.manifolds.push(manifold);
        }
      }
    }

    // 3. Resolve collisions with solver iterations
    for (let iter = 0; iter < this.iterations; iter++) {
      for (const manifold of this.manifolds) {
        ImpulseSolver.solveCollision(manifold);
      }
    }

    // 4. Integrate positions and angles (Symplectic Euler)
    for (const body of this.bodies) {
      if (body.isStatic) continue;
      body.position = body.position.add(body.velocity.scale(dt));
      body.angle += body.angularVelocity * dt;
    }
  }
}
