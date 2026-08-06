import { Vector2 } from './Vector2';

export class Matrix2 {
  constructor(
    public m00: number = 1,
    public m01: number = 0,
    public m10: number = 0,
    public m11: number = 1
  ) {}

  static fromAngle(radians: number): Matrix2 {
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return new Matrix2(cos, -sin, sin, cos);
  }

  transform(v: Vector2): Vector2 {
    return new Vector2(
      this.m00 * v.x + this.m01 * v.y,
      this.m10 * v.x + this.m11 * v.y
    );
  }
}
