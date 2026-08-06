import { describe, it, expect } from 'vitest';
import { Vector2 } from '../src/math/Vector2';
import { RigidBody } from '../src/body/RigidBody';
import { CircleShape, BoxShape } from '../src/body/Shape';
import { Narrowphase } from '../src/collision/Narrowphase';

describe('Narrowphase Collision Detection', () => {
  it('detects circle vs circle collision', () => {
    const c1 = new RigidBody({ position: new Vector2(0, 0), shape: new CircleShape(2) });
    const c2 = new RigidBody({ position: new Vector2(3, 0), shape: new CircleShape(2) });

    const manifold = Narrowphase.detectCollision(c1, c2);
    expect(manifold).not.toBeNull();
    expect(manifold!.depth).toBeCloseTo(1.0); // 2 + 2 - 3 = 1
    expect(manifold!.normal.x).toBeCloseTo(1.0);
    expect(manifold!.normal.y).toBeCloseTo(0.0);
  });

  it('detects box vs box collision using SAT', () => {
    const b1 = new RigidBody({ position: new Vector2(0, 0), shape: new BoxShape(2, 2) });
    const b2 = new RigidBody({ position: new Vector2(1.5, 0), shape: new BoxShape(2, 2) });

    const manifold = Narrowphase.detectCollision(b1, b2);
    expect(manifold).not.toBeNull();
    expect(manifold!.depth).toBeCloseTo(0.5);
  });

  it('detects circle vs box collision', () => {
    const circle = new RigidBody({ position: new Vector2(0, 0), shape: new CircleShape(1) });
    const box = new RigidBody({ position: new Vector2(1.5, 0), shape: new BoxShape(2, 2) });

    const manifold = Narrowphase.detectCollision(circle, box);
    expect(manifold).not.toBeNull();
    expect(manifold!.depth).toBeCloseTo(0.5); // (1 + 1) - 1.5 = 0.5
    expect(manifold!.normal.x).toBeCloseTo(1.0);
    expect(manifold!.normal.y).toBeCloseTo(0.0);
  });

  it('detects rotated box collision using SAT', () => {
    const b1 = new RigidBody({ position: new Vector2(0, 0), angle: Math.PI / 4, shape: new BoxShape(2, 2) });
    const b2 = new RigidBody({ position: new Vector2(1.2, 0), angle: 0, shape: new BoxShape(2, 2) });

    const manifold = Narrowphase.detectCollision(b1, b2);
    expect(manifold).not.toBeNull();
    expect(manifold!.depth).toBeGreaterThan(0);
  });

  it('returns null when bodies are separated', () => {
    const c1 = new RigidBody({ position: new Vector2(0, 0), shape: new CircleShape(1) });
    const c2 = new RigidBody({ position: new Vector2(10, 10), shape: new CircleShape(1) });

    const manifold = Narrowphase.detectCollision(c1, c2);
    expect(manifold).toBeNull();
  });
});

