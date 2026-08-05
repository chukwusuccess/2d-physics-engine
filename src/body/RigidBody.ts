import { Vector2 } from '../math/Vector2';
import { Shape } from './Shape';

export interface RigidBodyOptions {
  position?: Vector2;
  velocity?: Vector2;
  angle?: number;
  angularVelocity?: number;
  mass?: number;
  restitution?: number;
  friction?: number;
  isStatic?: boolean;
  shape: Shape;
}

export class RigidBody {
  public position: Vector2;
  public velocity: Vector2;
  public force: Vector2 = Vector2.zero();
  public angle: number;
  public angularVelocity: number;
  public torque: number = 0;

  public mass: number;
  public invMass: number;
  public inertia: number;
  public invInertia: number;

  public restitution: number;
  public friction: number;
  public isStatic: boolean;
  public shape: Shape;

  constructor(options: RigidBodyOptions) {
    this.position = options.position || Vector2.zero();
    this.velocity = options.velocity || Vector2.zero();
    this.angle = options.angle || 0;
    this.angularVelocity = options.angularVelocity || 0;
    this.restitution = options.restitution ?? 0.4;
    this.friction = options.friction ?? 0.3;
    this.isStatic = options.isStatic ?? false;
    this.shape = options.shape;

    if (this.isStatic || options.mass === 0) {
      this.mass = 0;
      this.invMass = 0;
      this.inertia = 0;
      this.invInertia = 0;
      this.isStatic = true;
    } else {
      this.mass = options.mass || 1.0;
      this.invMass = 1.0 / this.mass;
      this.inertia = this.shape.calculateInertia(this.mass);
      this.invInertia = this.inertia > 0 ? 1.0 / this.inertia : 0;
    }
  }

  applyForce(f: Vector2): void {
    if (this.isStatic) return;
    this.force = this.force.add(f);
  }

  applyImpulse(impulse: Vector2, contactVector: Vector2): void {
    if (this.isStatic) return;
    this.velocity = this.velocity.add(impulse.scale(this.invMass));
    this.angularVelocity += this.invInertia * contactVector.cross(impulse);
  }
}
