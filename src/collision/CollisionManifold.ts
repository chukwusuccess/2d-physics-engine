import { RigidBody } from '../body/RigidBody';
import { Vector2 } from '../math/Vector2';

export interface CollisionManifold {
  bodyA: RigidBody;
  bodyB: RigidBody;
  normal: Vector2; // Points from bodyA toward bodyB
  depth: number;
  contacts: Vector2[];
}
