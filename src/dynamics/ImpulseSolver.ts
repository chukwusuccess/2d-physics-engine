import { CollisionManifold } from '../collision/CollisionManifold';
import { Vector2 } from '../math/Vector2';

export class ImpulseSolver {
  public static solveCollision(manifold: CollisionManifold): void {
    const { bodyA, bodyB, normal, depth, contacts } = manifold;
    const invMassA = bodyA.invMass;
    const invMassB = bodyB.invMass;
    const totalInvMass = invMassA + invMassB;

    if (totalInvMass === 0) return;

    // Contact point (use first contact if multiple)
    const contactPoint = contacts[0] || bodyA.position.add(bodyB.position).scale(0.5);
    const rA = contactPoint.sub(bodyA.position);
    const rB = contactPoint.sub(bodyB.position);

    // Relative velocity at contact point
    const vA = bodyA.velocity.add(new Vector2(-bodyA.angularVelocity * rA.y, bodyA.angularVelocity * rA.x));
    const vB = bodyB.velocity.add(new Vector2(-bodyB.angularVelocity * rB.y, bodyB.angularVelocity * rB.x));
    const relativeVelocity = vB.sub(vA);

    const normalVelocity = relativeVelocity.dot(normal);

    // Do not resolve if velocities are separating
    if (normalVelocity > 0) return;

    const e = Math.min(bodyA.restitution, bodyB.restitution);
    const rACrossN = rA.cross(normal);
    const rBCrossN = rB.cross(normal);

    const normalImpulseDenominator =
      totalInvMass +
      rACrossN * rACrossN * bodyA.invInertia +
      rBCrossN * rBCrossN * bodyB.invInertia;

    const jn = (-(1 + e) * normalVelocity) / normalImpulseDenominator;
    const impulseN = normal.scale(jn);

    bodyA.applyImpulse(impulseN.negate(), rA);
    bodyB.applyImpulse(impulseN, rB);

    // Friction Impulse
    const vAAfter = bodyA.velocity.add(new Vector2(-bodyA.angularVelocity * rA.y, bodyA.angularVelocity * rA.x));
    const vBAfter = bodyB.velocity.add(new Vector2(-bodyB.angularVelocity * rB.y, bodyB.angularVelocity * rB.x));
    const relVelAfter = vBAfter.sub(vAAfter);

    const tangent = relVelAfter.sub(normal.scale(relVelAfter.dot(normal))).normalize();
    if (tangent.magnitudeSquared() > 0.000001) {
      const rACrossT = rA.cross(tangent);
      const rBCrossT = rB.cross(tangent);

      const tangentDenominator =
        totalInvMass +
        rACrossT * rACrossT * bodyA.invInertia +
        rBCrossT * rBCrossT * bodyB.invInertia;

      let jt = -relVelAfter.dot(tangent) / tangentDenominator;
      const mu = Math.sqrt(bodyA.friction * bodyB.friction);

      // Coulomb's law clamping
      const maxFriction = mu * jn;
      jt = Math.max(-maxFriction, Math.min(maxFriction, jt));

      const impulseT = tangent.scale(jt);
      bodyA.applyImpulse(impulseT.negate(), rA);
      bodyB.applyImpulse(impulseT, rB);
    }

    // Positional correction to prevent sinking/penetration artifact
    const percent = 0.4; // Penetration percentage to resolve
    const slop = 0.01; // Penetration allowance
    const correctionMagnitude = (Math.max(depth - slop, 0) / totalInvMass) * percent;
    const correction = normal.scale(correctionMagnitude);

    if (!bodyA.isStatic) {
      bodyA.position = bodyA.position.sub(correction.scale(invMassA));
    }
    if (!bodyB.isStatic) {
      bodyB.position = bodyB.position.add(correction.scale(invMassB));
    }
  }
}
