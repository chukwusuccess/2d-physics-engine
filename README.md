# ⚡ 2D Rigid Body Physics Engine

A modular, lightweight, high-performance 2D Rigid Body Physics Engine written in **TypeScript**. Powered by **Separating Axis Theorem (SAT)** collision detection, **Impulse Dynamics Solver** for velocity & angular resolution, and a **Symplectic Euler** integrator.

Includes an interactive HTML5 Canvas visual laboratory with real-time parameter tweaking and mouse-driven object manipulation.

---

## ✨ Features

- 📐 **Vector & Matrix Math**: High-performance 2D vector (`Vector2`) and 2x2 matrix (`Matrix2`) transformations.
- 🔷 **Flexible Shapes**:
  - `CircleShape`: Radii-based collisions and moment of inertia calculation.
  - `BoxShape`: Oriented bounding box (OBB) with arbitrary angular rotation support.
  - `PolygonShape`: Convex polygon support with centroid-based inertia tensors.
- 💥 **SAT Collision Detection (`Narrowphase`)**:
  - Separating Axis Theorem (SAT) for convex shape-to-shape overlap detection.
  - Accurate Minimum Translation Vector (MTV) penetration depth & normal calculation.
  - Generates detailed collision manifolds (`CollisionManifold`).
- ⚡ **Impulse Dynamics & Friction (`ImpulseSolver`)**:
  - Linear and angular velocity impulse resolution.
  - Coefficient of restitution (bounciness) handling.
  - Coulomb friction model with static/dynamic clamping.
  - Positional correction (slop mitigation) to resolve overlaps without sinking artifacts.
- 🌎 **World Simulation Loop (`World`)**:
  - Configurable gravity vectors and solver iteration steps.
  - Symplectic Euler numerical integration for stability.
- 🎨 **HTML5 Canvas Renderer (`CanvasRenderer`)**:
  - Multi-theme visual rendering with grid overlay.
  - Debug visualizers for contact points, collision normals, and velocity vectors.
- 🕹️ **Interactive Demo Playground**:
  - Real-time parameter tweaking (Gravity, Restitution, Friction, Solver Iterations).
  - Mouse click-and-drag spring throwing.
  - Preset scenes (Box Stacks, Pyramids, Newton's Cradle).

---

## 📁 Repository Structure

```text
2d-physics-engine/
├── src/
│   ├── math/
│   │   ├── Vector2.ts             # 2D Vector math operations
│   │   └── Matrix2.ts             # 2x2 Rotation & transformation matrix
│   ├── body/
│   │   ├── RigidBody.ts           # Mass, velocity, inertia, force accumulator
│   │   └── Shape.ts               # Circle, Box, and Polygon shape primitives
│   ├── collision/
│   │   ├── CollisionManifold.ts   # Contact point & normal data structure
│   │   └── Narrowphase.ts         # SAT Collision detection algorithm
│   ├── dynamics/
│   │   ├── ImpulseSolver.ts       # Impulse resolution & friction solver
│   │   └── World.ts               # Physics simulation loop & state manager
│   ├── render/
│   │   └── CanvasRenderer.ts      # HTML5 Canvas visualizer
│   └── index.ts                   # Public API exports
├── demo/
│   ├── index.html                 # Interactive playground entry point
│   ├── main.ts                    # UI event handlers & render loop
│   └── style.css                  # Modern glassmorphism UI styles
├── tests/
│   ├── math.test.ts               # Math unit tests
│   ├── body.test.ts               # RigidBody inertia & property tests
│   └── collision.test.ts          # SAT Narrowphase collision unit tests
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd 2d-physics-engine

# Install dependencies
npm install
```

### Running the Interactive Playground

```bash
npm run dev
```

Open your browser at `http://localhost:5173/` (or the port specified in terminal).

### Running Unit Tests

```bash
npm test
```

---

## 💻 Usage Example

```typescript
import { World, RigidBody, CircleShape, BoxShape, Vector2 } from '2d-physics-engine';

// 1. Instantiate the physics world
const world = new World(new Vector2(0, 9.81 * 50)); // Downward gravity

// 2. Create a static ground box
const ground = new RigidBody({
  position: new Vector2(400, 580),
  shape: new BoxShape(800, 40),
  isStatic: true,
});
world.addBody(ground);

// 3. Create a dynamic bouncing circle
const ball = new RigidBody({
  position: new Vector2(400, 100),
  shape: new CircleShape(25),
  mass: 2.0,
  restitution: 0.8, // 80% bounciness
});
world.addBody(ball);

// 4. Step the simulation loop (60 FPS)
const dt = 1 / 60;
function animate() {
  world.step(dt);
  console.log(`Ball Y: ${ball.position.y}, Velocity: ${ball.velocity.y}`);
  requestAnimationFrame(animate);
}
animate();
```

---

## 🧮 Mathematical Foundations

### 1. Separating Axis Theorem (SAT)
Given two convex shapes $A$ and $B$, if there exists an axis along which the projections of $A$ and $B$ do not overlap, the shapes are separated:
$$\text{Overlap}(A, B, \mathbf{n}) = \min(\max(A \cdot \mathbf{n}), \max(B \cdot \mathbf{n})) - \max(\min(A \cdot \mathbf{n}), \min(B \cdot \mathbf{n}))$$
The collision normal $\mathbf{n}$ is chosen from the axis producing the **Minimum Translation Vector (MTV)**.

### 2. Collision Impulse Solver
The impulse magnitude $j_n$ along contact normal $\mathbf{n}$ resolving linear and angular momentum:
$$j_n = \frac{-(1 + e) (\mathbf{v}_{rel} \cdot \mathbf{n})}{\frac{1}{m_A} + \frac{1}{m_B} + \frac{(\mathbf{r}_A \times \mathbf{n})^2}{I_A} + \frac{(\mathbf{r}_B \times \mathbf{n})^2}{I_B}}$$

Where:
- $e$: Coefficient of restitution ($\min(e_A, e_B)$)
- $\mathbf{r}_A, \mathbf{r}_B$: Vector from body center of mass to contact point
- $I_A, I_B$: Moment of inertia

---

## 📜 License

MIT License. Free for personal and commercial use.
