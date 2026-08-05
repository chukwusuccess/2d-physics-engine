import { Vector2 } from '../math/Vector2';
import { Matrix2 } from '../math/Matrix2';

export type ShapeType = 'circle' | 'box' | 'polygon';

export interface Shape {
  type: ShapeType;
  calculateInertia(mass: number): number;
}

export class CircleShape implements Shape {
  type: ShapeType = 'circle';
  constructor(public radius: number) {}

  calculateInertia(mass: number): number {
    if (mass === 0) return 0;
    return 0.5 * mass * this.radius * this.radius;
  }
}

export class BoxShape implements Shape {
  type: ShapeType = 'box';
  constructor(public width: number, public height: number) {}

  calculateInertia(mass: number): number {
    if (mass === 0) return 0;
    return (1 / 12) * mass * (this.width * this.width + this.height * this.height);
  }

  getVertices(position: Vector2, angle: number): Vector2[] {
    const hw = this.width / 2;
    const hh = this.height / 2;
    const rot = Matrix2.fromAngle(angle);
    const localVerts = [
      new Vector2(-hw, -hh),
      new Vector2(hw, -hh),
      new Vector2(hw, hh),
      new Vector2(-hw, hh),
    ];
    return localVerts.map(v => rot.transform(v).add(position));
  }
}

export class PolygonShape implements Shape {
  type: ShapeType = 'polygon';
  constructor(public vertices: Vector2[]) {} // Local vertices relative to centroid

  calculateInertia(mass: number): number {
    if (mass === 0) return 0;
    // Approximating inertia using bounding box radius
    let maxDistSq = 0;
    for (const v of this.vertices) {
      maxDistSq = Math.max(maxDistSq, v.magnitudeSquared());
    }
    return 0.5 * mass * maxDistSq;
  }

  getWorldVertices(position: Vector2, angle: number): Vector2[] {
    const rot = Matrix2.fromAngle(angle);
    return this.vertices.map(v => rot.transform(v).add(position));
  }
}
