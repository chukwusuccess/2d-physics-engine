import { describe, it, expect } from 'vitest';
import { Vector2 } from '../src/math/Vector2';
import { Matrix2 } from '../src/math/Matrix2';

describe('Vector2 Math', () => {
  it('performs vector addition and scalar multiplication', () => {
    const v1 = new Vector2(3, 4);
    const v2 = new Vector2(1, -2);
    const added = v1.add(v2);
    expect(added.x).toBe(4);
    expect(added.y).toBe(2);

    const scaled = v1.scale(2);
    expect(scaled.x).toBe(6);
    expect(scaled.y).toBe(8);
  });

  it('calculates magnitude, dot product, and normalization', () => {
    const v = new Vector2(3, 4);
    expect(v.magnitude()).toBe(5);
    expect(v.dot(new Vector2(1, 0))).toBe(3);

    const norm = v.normalize();
    expect(norm.magnitude()).toBeCloseTo(1.0);
    expect(norm.x).toBeCloseTo(0.6);
    expect(norm.y).toBeCloseTo(0.8);
  });

  it('calculates 2D cross product', () => {
    const a = new Vector2(1, 0);
    const b = new Vector2(0, 1);
    expect(a.cross(b)).toBe(1);
  });
});

describe('Matrix2 Math', () => {
  it('rotates vector by angle correctly', () => {
    const rot90 = Matrix2.fromAngle(Math.PI / 2);
    const v = new Vector2(1, 0);
    const rotated = rot90.transform(v);
    expect(rotated.x).toBeCloseTo(0);
    expect(rotated.y).toBeCloseTo(1);
  });
});
