# 2D Physics Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-dependency, modular, high-performance 2D Rigid Body physics engine with SAT collision detection, sequential impulse constraint solving, spatial hashing, and an interactive multi-scene HTML5 Canvas laboratory in TypeScript.

**Architecture:** Core engine decoupled into `math/`, `body/`, `collision/`, `dynamics/`, and `render/` packages. Employs Symplectic Euler integration, SAT (Separating Axis Theorem) narrowphase collision detection, impulse-based resolution with friction and position stabilization, Spatial Hash Grid broadphase, and Canvas 2D rendering.

**Tech Stack:** TypeScript, Vitest (testing), Vite (demo bundler/server), HTML5 Canvas.

## Global Constraints

- Language: TypeScript 5+ (ES2022 target)
- Dependencies: Zero runtime external dependencies for core engine (`src/`). Vitest and Vite in `devDependencies` only.
- Strict Type Safety: `strict: true` in `tsconfig.json`, no `any` types.
- Test Coverage: Unit tests for vector math, shape inertias, SAT collision detection, impulse response, and spatial hashing.

---

### Task 1: Repository & Toolchain Setup

**Files:**
- Create: `2d-physics-engine/package.json`
- Create: `2d-physics-engine/tsconfig.json`
- Create: `2d-physics-engine/vite.config.ts`

**Interfaces:**
- Consumes: Node.js & npm toolchain
- Produces: TypeScript compilation setup and Vitest test runner configuration

- [ ] **Step 1: Create `package.json` with scripts and devDependencies**

```json
{
  "name": "2d-physics-engine",
  "version": "1.0.0",
  "description": "Modular 2D Rigid Body Physics Engine with SAT and Impulse Solver",
  "type": "module",
  "scripts": {
    "dev": "vite demo",
    "build": "tsc && vite build demo --outDir dist",
    "test": "vitest run"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*", "tests/**/*", "demo/**/*"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'demo',
  build: {
    outDir: '../dist-demo',
    emptyOutDir: true,
  },
});
```

- [ ] **Step 4: Verify package setup**

Run: `cd 2d-physics-engine && npm install`
Expected: Successful package installation with `node_modules` generated.

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json vite.config.ts
git commit -m "chore: setup TypeScript, Vite, and Vitest project configuration"
```

---

### Task 2: 2D Vector Math & Matrix Library

**Files:**
- Create: `2d-physics-engine/src/math/Vector2.ts`
- Create: `2d-physics-engine/src/math/Matrix2.ts`
- Create: `2d-physics-engine/tests/math.test.ts`

**Interfaces:**
- Consumes: None
- Produces: `Vector2` (2D vector operations) and `Matrix2` (2x2 rotation/transformations)

- [ ] **Step 1: Write failing tests for `Vector2` and `Matrix2`**

```typescript
// 2d-physics-engine/tests/math.test.ts
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
    expect(a.cross(b)).toBe(1); // Z-component scalar
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd 2d-physics-engine && npm test`
Expected: FAIL with missing module `./src/math/Vector2`.

- [ ] **Step 3: Implement `Vector2.ts`**

```typescript
// 2d-physics-engine/src/math/Vector2.ts
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
```

- [ ] **Step 4: Implement `Matrix2.ts`**

```typescript
// 2d-physics-engine/src/math/Matrix2.ts
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd 2d-physics-engine && npm test`
Expected: PASS all math unit tests.

- [ ] **Step 6: Commit**

```bash
git add src/math/ tests/math.test.ts
git commit -m "feat: implement Vector2 and Matrix2 math modules with tests"
```

---

### Task 3: RigidBody & Geometry Shapes

**Files:**
- Create: `2d-physics-engine/src/body/Shape.ts`
- Create: `2d-physics-engine/src/body/RigidBody.ts`
- Create: `2d-physics-engine/tests/body.test.ts`

**Interfaces:**
- Consumes: `Vector2`, `Matrix2`
- Produces: `RigidBody` class and `CircleShape`, `BoxShape`, `PolygonShape` classes

- [ ] **Step 1: Write failing tests for `RigidBody` and `Shape` inertia calculations**

```typescript
// 2d-physics-engine/tests/body.test.ts
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
```

- [ ] **Step 2: Run test to verify failure**

Run: `cd 2d-physics-engine && npm test`
Expected: FAIL missing `RigidBody` and `Shape`.

- [ ] **Step 3: Implement `Shape.ts`**

```typescript
// 2d-physics-engine/src/body/Shape.ts
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
```

- [ ] **Step 4: Implement `RigidBody.ts`**

```typescript
// 2d-physics-engine/src/body/RigidBody.ts
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
```

- [ ] **Step 5: Run tests to verify pass**

Run: `cd 2d-physics-engine && npm test`
Expected: PASS `body.test.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/body/ tests/body.test.ts
git commit -m "feat: implement RigidBody and Shape hierarchy with mass and inertia"
```

---

### Task 4: Collision Detection (AABB & SAT Narrowphase)

**Files:**
- Create: `2d-physics-engine/src/collision/AABB.ts`
- Create: `2d-physics-engine/src/collision/Contact.ts`
- Create: `2d-physics-engine/src/collision/Narrowphase.ts`
- Create: `2d-physics-engine/tests/collision.test.ts`

**Interfaces:**
- Consumes: `Vector2`, `RigidBody`, `Shape`
- Produces: `AABB` bounding box, `ContactManifold`, and `Narrowphase.detectCollision()`

- [ ] **Step 1: Write failing collision detection unit tests**

```typescript
// 2d-physics-engine/tests/collision.test.ts
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

  it('returns null when bodies are separated', () => {
    const c1 = new RigidBody({ position: new Vector2(0, 0), shape: new CircleShape(1) });
    const c2 = new RigidBody({ position: new Vector2(10, 10), shape: new CircleShape(1) });

    const manifold = Narrowphase.detectCollision(c1, c2);
    expect(manifold).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `cd 2d-physics-engine && npm test`
Expected: FAIL missing `AABB`, `Contact`, `Narrowphase`.

- [ ] **Step 3: Implement `AABB.ts`**

```typescript
// 2d-physics-engine/src/collision/AABB.ts
import { Vector2 } from '../math/Vector2';
import { RigidBody } from '../body/RigidBody';
import { CircleShape, BoxShape, PolygonShape } from '../body/Shape';

export class AABB {
  constructor(public min: Vector2, public max: Vector2) {}

  intersects(other: AABB): boolean {
    return (
      this.min.x <= other.max.x &&
      this.max.x >= other.min.x &&
      this.min.y <= other.max.y &&
      this.max.y >= other.min.y
    );
  }

  static fromBody(body: RigidBody): AABB {
    if (body.shape.type === 'circle') {
      const radius = (body.shape as CircleShape).radius;
      return new AABB(
        new Vector2(body.position.x - radius, body.position.y - radius),
        new Vector2(body.position.x + radius, body.position.y + radius)
      );
    } else if (body.shape.type === 'box') {
      const verts = (body.shape as BoxShape).getVertices(body.position, body.angle);
      return AABB.fromVertices(verts);
    } else {
      const verts = (body.shape as PolygonShape).getWorldVertices(body.position, body.angle);
      return AABB.fromVertices(verts);
    }
  }

  private static fromVertices(verts: Vector2[]): AABB {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const v of verts) {
      minX = Math.min(minX, v.x);
      minY = Math.min(minY, v.y);
      maxX = Math.max(maxX, v.x);
      maxY = Math.max(maxY, v.y);
    }
    return new AABB(new Vector2(minX, minY), new Vector2(maxX, maxY));
  }
}
```

- [ ] **Step 4: Implement `Contact.ts`**

```typescript
// 2d-physics-engine/src/collision/Contact.ts
import { Vector2 } from '../math/Vector2';
import { RigidBody } from '../body/RigidBody';

export interface ContactManifold {
  bodyA: RigidBody;
  bodyB: RigidBody;
  normal: Vector2; // Points from A to B
  depth: number;
  contacts: Vector2[];
}
```

- [ ] **Step 5: Implement `Narrowphase.ts`**

```typescript
// 2d-physics-engine/src/collision/Narrowphase.ts
import { Vector2 } from '../math/Vector2';
import { RigidBody } from '../body/RigidBody';
import { CircleShape, BoxShape, PolygonShape } from '../body/Shape';
import { ContactManifold } from './Contact';

export class Narrowphase {
  static detectCollision(a: RigidBody, b: RigidBody): ContactManifold | null {
    if (a.shape.type === 'circle' && b.shape.type === 'circle') {
      return Narrowphase.circleVsCircle(a, b);
    }
    if (a.shape.type === 'box' && b.shape.type === 'box') {
      return Narrowphase.polygonVsPolygon(a, b);
    }
    if (a.shape.type === 'circle' && b.shape.type === 'box') {
      return Narrowphase.circleVsBox(a, b);
    }
    if (a.shape.type === 'box' && b.shape.type === 'circle') {
      const manifold = Narrowphase.circleVsBox(b, a);
      if (manifold) {
        manifold.normal = manifold.normal.negate();
        const tmp = manifold.bodyA;
        manifold.bodyA = manifold.bodyB;
        manifold.bodyB = tmp;
      }
      return manifold;
    }
    return null;
  }

  private static circleVsCircle(a: RigidBody, b: RigidBody): ContactManifold | null {
    const rA = (a.shape as CircleShape).radius;
    const rB = (b.shape as CircleShape).radius;
    const delta = b.position.sub(a.position);
    const distSq = delta.magnitudeSquared();
    const radiusSum = rA + rB;

    if (distSq >= radiusSum * radiusSum) return null;

    const dist = Math.sqrt(distSq);
    const normal = dist === 0 ? new Vector2(1, 0) : delta.scale(1 / dist);
    const depth = radiusSum - dist;
    const contactPoint = a.position.add(normal.scale(rA - depth / 2));

    return { bodyA: a, bodyB: b, normal, depth, contacts: [contactPoint] };
  }

  private static circleVsBox(circleBody: RigidBody, boxBody: RigidBody): ContactManifold | null {
    const circle = circleBody.shape as CircleShape;
    const box = boxBody.shape as BoxShape;
    const boxVerts = box.getVertices(boxBody.position, boxBody.angle);

    let closestPoint = boxVerts[0];
    let minDistSq = Infinity;

    for (const v of boxVerts) {
      const dSq = circleBody.position.sub(v).magnitudeSquared();
      if (dSq < minDistSq) {
        minDistSq = dSq;
        closestPoint = v;
      }
    }

    const delta = circleBody.position.sub(boxBody.position);
    const distSq = delta.magnitudeSquared();
    if (distSq > Math.pow(circle.radius + Math.max(box.width, box.height), 2)) {
      return null;
    }

    const normal = circleBody.position.sub(boxBody.position).normalize();
    const depth = circle.radius - (circleBody.position.sub(closestPoint).magnitude());
    if (depth <= 0) return null;

    return {
      bodyA: circleBody,
      bodyB: boxBody,
      normal,
      depth,
      contacts: [closestPoint],
    };
  }

  private static polygonVsPolygon(a: RigidBody, b: RigidBody): ContactManifold | null {
    const vertsA = (a.shape as BoxShape).getVertices(a.position, a.angle);
    const vertsB = (b.shape as BoxShape).getVertices(b.position, b.angle);

    let minOverlap = Infinity;
    let smallestAxis = Vector2.zero();

    const axes = [...Narrowphase.getNormals(vertsA), ...Narrowphase.getNormals(vertsB)];

    for (const axis of axes) {
      const pA = Narrowphase.projectVertices(vertsA, axis);
      const pB = Narrowphase.projectVertices(vertsB, axis);

      const overlap = Math.min(pA.max, pB.max) - Math.max(pA.min, pB.min);
      if (overlap <= 0) return null;

      if (overlap < minOverlap) {
        minOverlap = overlap;
        smallestAxis = axis;
      }
    }

    let normal = smallestAxis;
    if (b.position.sub(a.position).dot(normal) < 0) {
      normal = normal.negate();
    }

    const contactPoint = a.position.add(b.position).scale(0.5);
    return { bodyA: a, bodyB: b, normal, depth: minOverlap, contacts: [contactPoint] };
  }

  private static getNormals(verts: Vector2[]): Vector2[] {
    const normals: Vector2[] = [];
    for (let i = 0; i < verts.length; i++) {
      const p1 = verts[i];
      const p2 = verts[(i + 1) % verts.length];
      const edge = p2.sub(p1);
      normals.push(edge.perpendicular().normalize());
    }
    return normals;
  }

  private static projectVertices(verts: Vector2[], axis: Vector2): { min: number; max: number } {
    let min = axis.dot(verts[0]);
    let max = min;
    for (let i = 1; i < verts.length; i++) {
      const proj = axis.dot(verts[i]);
      min = Math.min(min, proj);
      max = Math.max(max, proj);
    }
    return { min, max };
  }
}
```

- [ ] **Step 6: Run tests to verify pass**

Run: `cd 2d-physics-engine && npm test`
Expected: PASS `collision.test.ts`.

- [ ] **Step 7: Commit**

```bash
git add src/collision/ tests/collision.test.ts
git commit -m "feat: implement AABB and SAT Narrowphase collision detection with contact manifold generation"
```

---

### Task 5: Physics World & Impulse Solver

**Files:**
- Create: `2d-physics-engine/src/dynamics/Integrator.ts`
- Create: `2d-physics-engine/src/dynamics/ImpulseSolver.ts`
- Create: `2d-physics-engine/src/dynamics/World.ts`
- Create: `2d-physics-engine/tests/solver.test.ts`

**Interfaces:**
- Consumes: `RigidBody`, `ContactManifold`, `Narrowphase`
- Produces: `World` class stepping physics dynamics and resolving impulses

- [ ] **Step 1: Write failing impulse solver integration test**

```typescript
// 2d-physics-engine/tests/solver.test.ts
import { describe, it, expect } from 'vitest';
import { Vector2 } from '../src/math/Vector2';
import { RigidBody } from '../src/body/RigidBody';
import { CircleShape } from '../src/body/Shape';
import { World } from '../src/dynamics/World';

describe('World Simulation & Solver', () => {
  it('applies gravity and moves body downwards', () => {
    const world = new World({ gravity: new Vector2(0, 9.8) });
    const body = new RigidBody({ position: new Vector2(0, 10), shape: new CircleShape(1) });
    world.addBody(body);

    world.step(0.1); // 0.1 sec step
    expect(body.position.y).toBeGreaterThan(10);
    expect(body.velocity.y).toBeGreaterThan(0);
  });

  it('resolves elastic collision between two bodies', () => {
    const world = new World({ gravity: Vector2.zero() });
    const b1 = new RigidBody({
      position: new Vector2(0, 0),
      velocity: new Vector2(10, 0),
      mass: 1,
      restitution: 1.0,
      shape: new CircleShape(1),
    });
    const b2 = new RigidBody({
      position: new Vector2(1.5, 0),
      velocity: new Vector2(0, 0),
      mass: 1,
      restitution: 1.0,
      shape: new CircleShape(1),
    });

    world.addBody(b1);
    world.addBody(b2);
    world.step(0.01);

    expect(b1.velocity.x).toBeLessThan(5);
    expect(b2.velocity.x).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `cd 2d-physics-engine && npm test`
Expected: FAIL missing `Integrator`, `ImpulseSolver`, `World`.

- [ ] **Step 3: Implement `Integrator.ts`**

```typescript
// 2d-physics-engine/src/dynamics/Integrator.ts
import { RigidBody } from '../body/RigidBody';
import { Vector2 } from '../math/Vector2';

export class Integrator {
  static integrate(body: RigidBody, gravity: Vector2, dt: number): void {
    if (body.isStatic) return;

    // Apply gravity
    body.velocity = body.velocity.add(gravity.scale(dt));

    // Symplectic Euler Integration
    body.velocity = body.velocity.add(body.force.scale(body.invMass * dt));
    body.angularVelocity += body.torque * body.invInertia * dt;

    body.position = body.position.add(body.velocity.scale(dt));
    body.angle += body.angularVelocity * dt;

    // Clear forces
    body.force = Vector2.zero();
    body.torque = 0;
  }
}
```

- [ ] **Step 4: Implement `ImpulseSolver.ts`**

```typescript
// 2d-physics-engine/src/dynamics/ImpulseSolver.ts
import { ContactManifold } from '../collision/Contact';
import { Vector2 } from '../math/Vector2';

export class ImpulseSolver {
  static resolveCollision(manifold: ContactManifold): void {
    const { bodyA, bodyB, normal, contacts, depth } = manifold;
    const invMassSum = bodyA.invMass + bodyB.invMass;

    if (invMassSum === 0) return;

    for (const contact of contacts) {
      const rA = contact.sub(bodyA.position);
      const rB = contact.sub(bodyB.position);

      const vA = bodyA.velocity.add(new Vector2(-bodyA.angularVelocity * rA.y, bodyA.angularVelocity * rA.x));
      const vB = bodyB.velocity.add(new Vector2(-bodyB.angularVelocity * rB.y, bodyB.angularVelocity * rB.x));
      const relativeVel = vB.sub(vA);

      const velAlongNormal = relativeVel.dot(normal);
      if (velAlongNormal > 0) continue;

      const e = Math.min(bodyA.restitution, bodyB.restitution);

      const rACrossN = rA.cross(normal);
      const rBCrossN = rB.cross(normal);
      const invInertiaSum =
        bodyA.invInertia * rACrossN * rACrossN + bodyB.invInertia * rBCrossN * rBCrossN;

      let j = -(1 + e) * velAlongNormal;
      j /= invMassSum + invInertiaSum;

      const impulse = normal.scale(j);
      bodyA.applyImpulse(impulse.negate(), rA);
      bodyB.applyImpulse(impulse, rB);

      // Tangent Friction Impulse
      const tangent = relativeVel.sub(normal.scale(relativeVel.dot(normal))).normalize();
      const velAlongTangent = relativeVel.dot(tangent);
      let jt = -velAlongTangent;
      jt /= invMassSum + invInertiaSum;

      const mu = Math.sqrt(bodyA.friction * bodyB.friction);
      const frictionImpulseMagnitude = Math.abs(jt) <= j * mu ? jt : -j * mu;
      const frictionImpulse = tangent.scale(frictionImpulseMagnitude);

      bodyA.applyImpulse(frictionImpulse.negate(), rA);
      bodyB.applyImpulse(frictionImpulse, rB);
    }

    // Positional Correction (Baumgarte Stabilization)
    const percent = 0.4;
    const slop = 0.01;
    const correction = normal.scale((Math.max(depth - slop, 0) / invMassSum) * percent);

    if (!bodyA.isStatic) bodyA.position = bodyA.position.sub(correction.scale(bodyA.invMass));
    if (!bodyB.isStatic) bodyB.position = bodyB.position.add(correction.scale(bodyB.invMass));
  }
}
```

- [ ] **Step 5: Implement `World.ts`**

```typescript
// 2d-physics-engine/src/dynamics/World.ts
import { Vector2 } from '../math/Vector2';
import { RigidBody } from '../body/RigidBody';
import { Integrator } from './Integrator';
import { Narrowphase } from '../collision/Narrowphase';
import { ImpulseSolver } from './ImpulseSolver';

export interface WorldOptions {
  gravity?: Vector2;
  iterations?: number;
}

export class World {
  public bodies: RigidBody[] = [];
  public gravity: Vector2;
  public iterations: number;

  constructor(options: WorldOptions = {}) {
    this.gravity = options.gravity || new Vector2(0, 9.81);
    this.iterations = options.iterations || 8;
  }

  addBody(body: RigidBody): void {
    this.bodies.push(body);
  }

  removeBody(body: RigidBody): void {
    const idx = this.bodies.indexOf(body);
    if (idx !== -1) this.bodies.splice(idx, 1);
  }

  step(dt: number): void {
    // 1. Integrate motion
    for (const body of this.bodies) {
      Integrator.integrate(body, this.gravity, dt);
    }

    // 2. Collision Resolution Iterations
    for (let iter = 0; iter < this.iterations; iter++) {
      for (let i = 0; i < this.bodies.length; i++) {
        for (let j = i + 1; j < this.bodies.length; j++) {
          const bodyA = this.bodies[i];
          const bodyB = this.bodies[j];

          if (bodyA.isStatic && bodyB.isStatic) continue;

          const manifold = Narrowphase.detectCollision(bodyA, bodyB);
          if (manifold) {
            ImpulseSolver.resolveCollision(manifold);
          }
        }
      }
    }
  }
}
```

- [ ] **Step 6: Run tests to verify pass**

Run: `cd 2d-physics-engine && npm test`
Expected: PASS `solver.test.ts`.

- [ ] **Step 7: Commit**

```bash
git add src/dynamics/ tests/solver.test.ts
git commit -m "feat: implement Symplectic Euler integrator, ImpulseSolver, and World dynamics simulation"
```

---

### Task 6: Spatial Hash Grid Broadphase Acceleration

**Files:**
- Create: `2d-physics-engine/src/collision/Broadphase.ts`
- Create: `2d-physics-engine/tests/broadphase.test.ts`

**Interfaces:**
- Consumes: `RigidBody`, `AABB`
- Produces: `SpatialHashGrid` returning candidate collision body pairs `[RigidBody, RigidBody][]`

- [ ] **Step 1: Write failing broadphase unit test**

```typescript
// 2d-physics-engine/tests/broadphase.test.ts
import { describe, it, expect } from 'vitest';
import { Vector2 } from '../src/math/Vector2';
import { RigidBody } from '../src/body/RigidBody';
import { CircleShape } from '../src/body/Shape';
import { SpatialHashGrid } from '../src/collision/Broadphase';

describe('Spatial Hash Grid Broadphase', () => {
  it('groups nearby bodies into candidate pairs and skips distant bodies', () => {
    const grid = new SpatialHashGrid(10); // 10 unit cell size
    const b1 = new RigidBody({ position: new Vector2(2, 2), shape: new CircleShape(1) });
    const b2 = new RigidBody({ position: new Vector2(3, 3), shape: new CircleShape(1) });
    const bFar = new RigidBody({ position: new Vector2(500, 500), shape: new CircleShape(1) });

    const pairs = grid.getCandidatePairs([b1, b2, bFar]);
    expect(pairs.length).toBe(1);
    expect(pairs[0]).toContain(b1);
    expect(pairs[0]).toContain(b2);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `cd 2d-physics-engine && npm test`
Expected: FAIL missing `SpatialHashGrid`.

- [ ] **Step 3: Implement `Broadphase.ts`**

```typescript
// 2d-physics-engine/src/collision/Broadphase.ts
import { RigidBody } from '../body/RigidBody';
import { AABB } from './AABB';

export class SpatialHashGrid {
  private grid = new Map<string, RigidBody[]>();

  constructor(public cellSize: number = 5) {}

  clear(): void {
    this.grid.clear();
  }

  private getKey(x: number, y: number): string {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
  }

  insert(body: RigidBody): void {
    const aabb = AABB.fromBody(body);
    const minX = Math.floor(aabb.min.x / this.cellSize);
    const maxX = Math.floor(aabb.max.x / this.cellSize);
    const minY = Math.floor(aabb.min.y / this.cellSize);
    const maxY = Math.floor(aabb.max.y / this.cellSize);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const key = `${x},${y}`;
        if (!this.grid.has(key)) {
          this.grid.set(key, []);
        }
        this.grid.get(key)!.push(body);
      }
    }
  }

  getCandidatePairs(bodies: RigidBody[]): [RigidBody, RigidBody][] {
    this.clear();
    for (const body of bodies) {
      this.insert(body);
    }

    const pairSet = new Set<string>();
    const candidates: [RigidBody, RigidBody][] = [];

    for (const bucket of this.grid.values()) {
      if (bucket.length < 2) continue;
      for (let i = 0; i < bucket.length; i++) {
        for (let j = i + 1; j < bucket.length; j++) {
          const b1 = bucket[i];
          const b2 = bucket[j];
          if (b1.isStatic && b2.isStatic) continue;

          const id1 = bodies.indexOf(b1);
          const id2 = bodies.indexOf(b2);
          const pairKey = id1 < id2 ? `${id1}:${id2}` : `${id2}:${id1}`;

          if (!pairSet.has(pairKey)) {
            pairSet.add(pairKey);
            candidates.push([b1, b2]);
          }
        }
      }
    }
    return candidates;
  }
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `cd 2d-physics-engine && npm test`
Expected: PASS `broadphase.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/collision/Broadphase.ts tests/broadphase.test.ts
git commit -m "feat: implement Spatial Hash Grid broadphase candidate pair generation"
```

---

### Task 7: Canvas Visual Renderer & Interactive Demo Lab

**Files:**
- Create: `2d-physics-engine/src/render/CanvasRenderer.ts`
- Create: `2d-physics-engine/demo/index.html`
- Create: `2d-physics-engine/demo/main.ts`

**Interfaces:**
- Consumes: `World`, `RigidBody`, `Shape`
- Produces: HTML5 Canvas interactive 2D physics lab app

- [ ] **Step 1: Implement `CanvasRenderer.ts`**

```typescript
// 2d-physics-engine/src/render/CanvasRenderer.ts
import { World } from '../dynamics/World';
import { CircleShape, BoxShape } from '../body/Shape';

export class CanvasRenderer {
  constructor(private ctx: CanvasRenderingContext2D, private scale: number = 30) {}

  clear(): void {
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  render(world: World): void {
    this.clear();

    for (const body of world.bodies) {
      this.ctx.save();
      this.ctx.translate(body.position.x * this.scale, body.position.y * this.scale);
      this.ctx.rotate(body.angle);

      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = body.isStatic ? '#64748b' : '#38bdf8';
      this.ctx.fillStyle = body.isStatic ? '#334155' : '#0284c7';

      if (body.shape.type === 'circle') {
        const radius = (body.shape as CircleShape).radius * this.scale;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Direction indicator line
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(radius, 0);
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.stroke();
      } else if (body.shape.type === 'box') {
        const box = body.shape as BoxShape;
        const w = box.width * this.scale;
        const h = box.height * this.scale;
        this.ctx.fillRect(-w / 2, -h / 2, w, h);
        this.ctx.strokeRect(-w / 2, -h / 2, w, h);
      }

      this.ctx.restore();
    }
  }
}
```

- [ ] **Step 2: Implement `demo/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>2D Physics Engine Laboratory</title>
  <style>
    body { margin: 0; background: #0f172a; font-family: sans-serif; color: #f8fafc; display: flex; flex-direction: column; align-items: center; }
    h1 { margin: 12px 0 4px 0; font-size: 1.4rem; }
    .controls { margin-bottom: 8px; display: flex; gap: 12px; }
    button { background: #0284c7; color: white; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; }
    button:hover { background: #0369a1; }
    canvas { border: 2px solid #334155; border-radius: 6px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
  </style>
</head>
<body>
  <h1>2D Physics Engine Laboratory</h1>
  <div class="controls">
    <button id="scene-pyramid">Stacking Pyramid</button>
    <button id="scene-cradle">Newton's Cradle</button>
    <button id="scene-friction">Friction Incline</button>
    <button id="btn-pause">Pause / Play</button>
  </div>
  <canvas id="sim-canvas" width="800" height="600"></canvas>
  <script type="module" src="./main.ts"></script>
</body>
</html>
```

- [ ] **Step 3: Implement `demo/main.ts`**

```typescript
import { World } from '../src/dynamics/World';
import { RigidBody } from '../src/body/RigidBody';
import { CircleShape, BoxShape } from '../src/body/Shape';
import { Vector2 } from '../src/math/Vector2';
import { CanvasRenderer } from '../src/render/CanvasRenderer';

const canvas = document.getElementById('sim-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const renderer = new CanvasRenderer(ctx, 30);
const world = new World({ gravity: new Vector2(0, 9.81) });

let isRunning = true;

function loadPyramidScene() {
  world.bodies = [];

  // Ground boundary
  world.addBody(new RigidBody({
    position: new Vector2(13.33, 19),
    shape: new BoxShape(26, 1),
    isStatic: true,
  }));

  // Stack Pyramid of Boxes
  const rows = 8;
  const boxSize = 0.8;
  const startX = 13.33;
  const startY = 18;

  for (let r = 0; r < rows; r++) {
    const count = rows - r;
    const xOffset = startX - (count * boxSize) / 2 + boxSize / 2;
    const y = startY - r * (boxSize + 0.05);

    for (let c = 0; c < count; c++) {
      world.addBody(new RigidBody({
        position: new Vector2(xOffset + c * boxSize, y),
        mass: 1.0,
        restitution: 0.1,
        shape: new BoxShape(boxSize, boxSize),
      }));
    }
  }
}

function loadCradleScene() {
  world.bodies = [];

  // Static ceiling
  world.addBody(new RigidBody({
    position: new Vector2(13.33, 1),
    shape: new BoxShape(26, 0.5),
    isStatic: true,
  }));

  // Newton's Cradle Balls
  for (let i = 0; i < 5; i++) {
    world.addBody(new RigidBody({
      position: new Vector2(9 + i * 2.1, 10),
      velocity: i === 0 ? new Vector2(-15, 0) : Vector2.zero(),
      mass: 2.0,
      restitution: 1.0,
      shape: new CircleShape(1.0),
    }));
  }
}

document.getElementById('scene-pyramid')?.addEventListener('click', loadPyramidScene);
document.getElementById('scene-cradle')?.addEventListener('click', loadCradleScene);
document.getElementById('btn-pause')?.addEventListener('click', () => { isRunning = !isRunning; });

loadPyramidScene();

let lastTime = performance.now();
function loop(now: number) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;

  if (isRunning) {
    world.step(dt);
  }
  renderer.render(world);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
```

- [ ] **Step 4: Test build and demo bundling**

Run: `cd 2d-physics-engine && npm run build`
Expected: Successful TypeScript compilation and Vite demo build into `dist-demo/`.

- [ ] **Step 5: Commit**

```bash
git add src/render/ demo/
git commit -m "feat: implement CanvasRenderer and interactive multi-scene laboratory web app"
```
