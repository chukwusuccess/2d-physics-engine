export class Vector2 {
  constructor(public x: number = 0, public y: number = 0) {}

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  sub(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  scale(s: number): Vector2 {
    return new Vector2(this.x * s, this.y * s);
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: Vector2): number {
    return this.x * v.y - this.y * v.x;
  }

  magnitude(): number {
    return Math.hypot(this.x, this.y);
  }

  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vector2 {
    const len = this.magnitude();
    if (len === 0) return new Vector2(0, 0);
    return new Vector2(this.x / len, this.y / len);
  }

  perpendicular(): Vector2 {
    return new Vector2(-this.y, this.x);
  }

  negate(): Vector2 {
    return new Vector2(-this.x, -this.y);
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  static zero(): Vector2 {
    return new Vector2(0, 0);
  }
}
