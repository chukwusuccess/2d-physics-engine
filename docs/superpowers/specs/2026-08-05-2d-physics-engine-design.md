# 2D Physics Engine — System Design & Architecture Specification

**Date**: 2026-08-05  
**Project**: `2d-physics-engine`  
**Language/Stack**: TypeScript, HTML5 Canvas, Vitest, Vite

---

## 1. Overview & Goals

The goal of `2d-physics-engine` is to provide a production-grade, modular, zero-external-runtime-dependency 2D rigid body physics engine written in modern TypeScript. It supports arbitrary convex polygons, circles, oriented bounding boxes (OBBs), impulse-based collision resolution with friction, joint constraints, spatial hashing for broadphase acceleration, and an interactive HTML5 Canvas visual laboratory.

### Core Goals
- **Modularity**: Every subsystem (math, shapes, broadphase, narrowphase SAT, dynamics solver, constraints) is strictly decoupled and independently unit-tested.
- **Accuracy & Stability**: Sequential impulse solver with Baumgarte stabilization / split impulse to eliminate overlap sinking and velocity jittering in stacked bodies.
- **Performance**: Spatial Hash Grid broadphase reducing collision candidate generation from $O(N^2)$ to $O(N)$.
- **Interactive Laboratory**: Feature-rich HTML5 Canvas demo featuring mouse drag/push forces, parameter sliders (gravity, friction, restitution, time step), and multiple diagnostic test scenes.

---

## 2. System Architecture

```
2d-physics-engine/
├── src/
│   ├── math/
│   │   ├── Vector2.ts         # 2D Vector math (add, sub, dot, cross, proj, norm)
│   │   └── Matrix2.ts         # 2x2 Rotation & Transformation Matrices
│   ├── body/
│   │   ├── RigidBody.ts       # Physical body (pos, vel, force, torque, angle, angVel, mass, inertia)
│   │   └── Shape.ts           # Shape geometry interfaces: Circle, Box (OBB), Polygon
│   ├── collision/
│   │   ├── AABB.ts            # Axis-Aligned Bounding Box
│   │   ├── Broadphase.ts      # Spatial Hash Grid for O(N) broadphase filtering
│   │   ├── Narrowphase.ts     # SAT (Separating Axis Theorem) & Circle collision detectors
│   │   └── Contact.ts         # Contact manifold (normal, depth, contact points)
│   ├── dynamics/
│   │   ├── World.ts           # Master physics simulation container & loop step
│   │   ├── Integrator.ts      # Symplectic Euler integration
│   │   ├── ImpulseSolver.ts   # Sequential Impulse Solver (velocity + positional bias)
│   │   └── Joint.ts           # DistanceJoint & RevoluteJoint constraints
│   └── render/
│       └── CanvasRenderer.ts  # Visualizer for shapes, velocity vectors, contacts, AABBs
├── tests/                     # Unit test suites
│   ├── math.test.ts
│   ├── collision.test.ts
│   ├── solver.test.ts
│   └── world.test.ts
└── demo/
    ├── index.html             # Interactive HTML5 visual lab dashboard
    └── main.ts                # Demo controller with scene presets
```

---

## 3. Detailed Component Specifications

### 3.1 Math Subsystem (`src/math/`)
* **`Vector2`**: Class with immutability options (`add`, `sub`, `scale`, `dot`, `cross`, `magnitude`, `normalize`, `rotate`, `perpendicular`).
* **`Matrix2`**: 2x2 matrix for body rotation $\mathbf{R}(\theta) = \begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}$ and transforming local vectors to world space.

### 3.2 Rigid Body & Geometry (`src/body/`)
* **`RigidBody`**:
  * **Linear state**: Position $\mathbf{x}$, velocity $\mathbf{v}$, force accumulator $\mathbf{F}$, mass $m$, inverse mass $w = 1/m$.
  * **Angular state**: Angle $\theta$, angular velocity $\omega$, torque accumulator $\tau$, moment of inertia $I$, inverse inertia $I^{-1}$.
  * **Material props**: Restitution $e \in [0, 1]$, static friction $\mu_s$, dynamic friction $\mu_d$.
  * **Body Type**: Static ($w = 0, I^{-1} = 0$), Dynamic ($w > 0$), Kinematic (velocity-driven, $w = 0$).
* **Shapes**:
  * `CircleShape`: Radius $r$. Moment of Inertia $I = \frac{1}{2} m r^2$.
  * `BoxShape`: Half-extents $(w, h)$. Moment of Inertia $I = \frac{1}{12} m (w^2 + h^2)$.
  * `PolygonShape`: Vertices array (convex hull). Computes centroid, area, and moment of inertia automatically.

### 3.3 Collision Pipeline (`src/collision/`)
1. **AABB & Broadphase**:
   * Each shape updates its world-space AABB.
   * `SpatialHashGrid`: Buckets scene space into cells of size $2 \times r_{\max}$. Returns candidate pairs $(A, B)$ sharing grid buckets.
2. **Narrowphase (Separating Axis Theorem - SAT)**:
   * **Circle vs. Circle**: Center distance check $\|\mathbf{c}_B - \mathbf{c}_A\| < r_A + r_B$.
   * **Circle vs. Polygon**: Axes are polygon face normals + vector from circle center to nearest polygon vertex.
   * **Polygon vs. Polygon**: Separating Axis Theorem (SAT). Tests face normals of Polygon A and Polygon B. Min penetration axis = contact normal $\hat{\mathbf{n}}$.
3. **Contact Manifold Generation**:
   * Evaluates 1 or 2 contact points $\mathbf{p}_i$ for polygon edge-edge or face-face collisions.
   * Stores penetration depth $d$, contact normal $\hat{\mathbf{n}}$, and contact points $\mathbf{p}_i$ for constraint solving.

### 3.4 Dynamics & Solver (`src/dynamics/`)
1. **Symplectic Euler Integrator**:
   $$\mathbf{v}_{t+\Delta t} = \mathbf{v}_t + \left(\mathbf{g} + \frac{\mathbf{F}}{m}\right) \Delta t$$
   $$\omega_{t+\Delta t} = \omega_t + \left(\frac{\tau}{I}\right) \Delta t$$
   $$\mathbf{x}_{t+\Delta t} = \mathbf{x}_t + \mathbf{v}_{t+\Delta t} \Delta t$$
   $$\theta_{t+\Delta t} = \theta_t + \omega_{t+\Delta t} \Delta t$$
2. **Impulse Solver (Velocity & Friction)**:
   * Relative contact velocity: $\mathbf{v}_{\text{rel}} = (\mathbf{v}_A + \mathbf{\omega}_A \times \mathbf{r}_A) - (\mathbf{v}_B + \mathbf{\omega}_B \times \mathbf{r}_B)$.
   * Normal Impulse magnitude $j_n$:
     $$j_n = \frac{-(1 + e) (\mathbf{v}_{\text{rel}} \cdot \hat{\mathbf{n}})}{\frac{1}{m_A} + \frac{1}{m_B} + \frac{(\mathbf{r}_A \times \hat{\mathbf{n}})^2}{I_A} + \frac{(\mathbf{r}_B \times \hat{\mathbf{n}})^2}{I_B}}$$
   * Friction Impulse magnitude $j_t$ along tangent $\hat{\mathbf{t}}$ (Coulomb friction model $|j_t| \le \mu j_n$).
3. **Position Correction (Baumgarte Stabilization)**:
   * Direct positional drift resolution to eliminate interpenetration without introducing artificial energy.

### 3.5 Interactive Canvas Laboratory (`src/render/` & `demo/`)
* **Visualization Controls**: Render shapes, bounding AABBs, velocity vectors, and contact points with color-coded normals.
* **Mouse Interactions**: Click & drag bodies with spring force constraint.
* **Interactive Control Panel**: Sliders for Gravity $g$, Restitution $e$, Friction $\mu$, Sub-stepping iterations, Play/Pause/Single-Step controls.
* **Preset Test Scenes**:
  1. *Pyramid Stacking*: 10-level box pyramid stability benchmark.
  2. *Newton's Cradle*: High-restitution energy conservation test.
  3. *Friction & Inclines*: Sliding boxes on variable angles.
  4. *Joint Chain / Rope*: Distance constraint pendulum.

---

## 4. Verification & Testing Strategy

1. **Unit Tests (Vitest)**:
   * Math: Vector operations, matrix rotation, dot/cross products.
   * Collision: Circle-Circle, Circle-Box, SAT Polygon-Polygon intersection & normal correctness.
   * Solver: Conservation of momentum in elastic collisions ($e = 1.0$), energy decay in inelastic collisions ($e = 0.0$).
2. **Visual Verification**:
   * Interactive demo running in browser verifying smooth 60 FPS performance and stable box stacking.

---

## 5. Implementation Steps

1. Setup project configuration (`package.json`, `tsconfig.json`, `vite.config.ts`).
2. Build math primitives (`Vector2`, `Matrix2`).
3. Build body and shape abstractions (`RigidBody`, `Circle`, `Box`, `Polygon`).
4. Implement AABB & SAT collision detection + manifold generator.
5. Implement Symplectic Euler integrator and impulse constraint solver.
6. Implement Spatial Hash Grid broadphase.
7. Build HTML5 Canvas renderer & interactive laboratory UI.
8. Add automated Vitest unit tests and verify stability.
