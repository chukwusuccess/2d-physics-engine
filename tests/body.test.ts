import { describe, it, expect } from 'vitest';
import { Vector2 } from '../src/math/Vector2';
import { RigidBody } from '../src/body/RigidBody';
import { CircleShape, BoxShape } from '../src/body/Shape';

describe('RigidBody and Shape', () => {
  it('calculates circle moment of inertia and mass properties', () => {
    const circle = new CircleShape(2); // radius = 2
    const body = new RigidBody({ mass: 10, shape: circle });
    expect(body.mass).toBe(10);
    expect(body.invMass).toBe(0.1);
    // Inertia = 1/2 * m * r^2 = 0.5 * 10 * 4 = 20
    expect(body.inertia).toBeCloseTo(20);
    expect(body.invInertia).toBeCloseTo(0.05);
  });

  it('handles static body inverse mass', () => {
    const box = new BoxShape(4, 4);
    const body = new RigidBody({ mass: 0, shape: box, isStatic: true });
    expect(body.invMass).toBe(0);
    expect(body.invInertia).toBe(0);
  });
});
