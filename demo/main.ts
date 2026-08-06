import { World } from '../src/dynamics/World';
import { CanvasRenderer, RenderOptions } from '../src/render/CanvasRenderer';
import { RigidBody } from '../src/body/RigidBody';
import { CircleShape, BoxShape, PolygonShape } from '../src/body/Shape';
import { Vector2 } from '../src/math/Vector2';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const container = document.getElementById('canvas-container') as HTMLDivElement;

const world = new World();
const renderer = new CanvasRenderer(canvas);

let isPaused = false;
let globalRestitution = 0.6;
let globalFriction = 0.3;

const renderOptions: RenderOptions = {
  showContactPoints: true,
  showNormals: true,
  showVelocities: false,
};

// UI Stats elements
const fpsEl = document.getElementById('stat-fps')!;
const bodiesEl = document.getElementById('stat-bodies')!;
const collisionsEl = document.getElementById('stat-collisions')!;
const timeEl = document.getElementById('stat-time')!;

// Resize handling
function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  renderer.resize(width, height);
  updateStaticBoundaries(width, height);
}

let floorBody: RigidBody | null = null;
let leftWallBody: RigidBody | null = null;
let rightWallBody: RigidBody | null = null;

function updateStaticBoundaries(width: number, height: number) {
  if (floorBody) world.removeBody(floorBody);
  if (leftWallBody) world.removeBody(leftWallBody);
  if (rightWallBody) world.removeBody(rightWallBody);

  const thickness = 60;
  floorBody = new RigidBody({
    position: new Vector2(width / 2, height + thickness / 2 - 20),
    shape: new BoxShape(width + 200, thickness),
    isStatic: true,
    restitution: globalRestitution,
    friction: globalFriction,
  });

  leftWallBody = new RigidBody({
    position: new Vector2(-thickness / 2 + 10, height / 2),
    shape: new BoxShape(thickness, height * 2),
    isStatic: true,
    restitution: globalRestitution,
    friction: globalFriction,
  });

  rightWallBody = new RigidBody({
    position: new Vector2(width + thickness / 2 - 10, height / 2),
    shape: new BoxShape(thickness, height * 2),
    isStatic: true,
    restitution: globalRestitution,
    friction: globalFriction,
  });

  world.addBody(floorBody);
  world.addBody(leftWallBody);
  world.addBody(rightWallBody);
}

// Initial Spawn Scene
function spawnInitialScene() {
  const width = container.clientWidth;
  
  // Spawn a stack of boxes
  const boxSize = 36;
  const startX = width / 2;
  const startY = container.clientHeight - 80;

  for (let i = 0; i < 7; i++) {
    const box = new RigidBody({
      position: new Vector2(startX + (Math.random() * 2 - 1), startY - i * (boxSize + 2)),
      shape: new BoxShape(boxSize, boxSize),
      mass: 1.5,
      restitution: globalRestitution,
      friction: globalFriction,
    });
    world.addBody(box);
  }

  // Spawn some bouncy circles
  for (let i = 0; i < 5; i++) {
    const radius = 16 + Math.random() * 12;
    const circle = new RigidBody({
      position: new Vector2(startX - 150 + i * 40, 100 + i * 30),
      shape: new CircleShape(radius),
      mass: radius * 0.1,
      restitution: 0.8,
      friction: globalFriction,
    });
    world.addBody(circle);
  }
}

// Mouse interaction (Drag and Throw)
let selectedBody: RigidBody | null = null;
let mousePos = Vector2.zero();
let lastMousePos = Vector2.zero();
let isDragging = false;

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  mousePos = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
  lastMousePos = mousePos.clone();

  // Find clicked body
  for (let i = world.bodies.length - 1; i >= 0; i--) {
    const body = world.bodies[i];
    if (body.isStatic) continue;

    if (isPointInsideBody(mousePos, body)) {
      selectedBody = body;
      isDragging = true;
      break;
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  lastMousePos = mousePos.clone();
  mousePos = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
});

window.addEventListener('mouseup', () => {
  if (selectedBody && isDragging) {
    const throwVel = mousePos.sub(lastMousePos).scale(20);
    selectedBody.velocity = throwVel;
  }
  selectedBody = null;
  isDragging = false;
});

function isPointInsideBody(point: Vector2, body: RigidBody): boolean {
  const shape = body.shape;
  if (shape.type === 'circle') {
    const distSq = point.sub(body.position).magnitudeSquared();
    return distSq <= (shape as CircleShape).radius * (shape as CircleShape).radius;
  } else if (shape.type === 'box') {
    const box = shape as BoxShape;
    const verts = box.getVertices(body.position, body.angle);
    return isPointInPolygon(point, verts);
  } else if (shape.type === 'polygon') {
    const poly = shape as PolygonShape;
    const verts = poly.getWorldVertices(body.position, body.angle);
    return isPointInPolygon(point, verts);
  }
  return false;
}

function isPointInPolygon(point: Vector2, verts: Vector2[]): boolean {
  let inside = false;
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const xi = verts[i].x, yi = verts[i].y;
    const xj = verts[j].x, yj = verts[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// UI Controls & Listeners
document.getElementById('btn-add-circle')?.addEventListener('click', () => {
  const radius = 18 + Math.random() * 12;
  const body = new RigidBody({
    position: new Vector2(container.clientWidth / 2 + (Math.random() * 100 - 50), 80),
    shape: new CircleShape(radius),
    mass: radius * 0.1,
    restitution: globalRestitution,
    friction: globalFriction,
  });
  world.addBody(body);
});

document.getElementById('btn-add-box')?.addEventListener('click', () => {
  const size = 32 + Math.floor(Math.random() * 16);
  const body = new RigidBody({
    position: new Vector2(container.clientWidth / 2 + (Math.random() * 100 - 50), 80),
    shape: new BoxShape(size, size),
    mass: 1.5,
    restitution: globalRestitution,
    friction: globalFriction,
  });
  world.addBody(body);
});

document.getElementById('btn-add-stack')?.addEventListener('click', () => {
  const boxSize = 32;
  const startX = container.clientWidth / 2;
  const startY = container.clientHeight - 80;
  for (let i = 0; i < 5; i++) {
    const box = new RigidBody({
      position: new Vector2(startX, startY - i * (boxSize + 2)),
      shape: new BoxShape(boxSize, boxSize),
      mass: 1.0,
      restitution: globalRestitution,
      friction: globalFriction,
    });
    world.addBody(box);
  }
});

document.getElementById('btn-add-pyramid')?.addEventListener('click', () => {
  const boxSize = 30;
  const rows = 4;
  const startX = container.clientWidth / 2;
  const startY = container.clientHeight - 80;

  for (let row = 0; row < rows; row++) {
    const count = rows - row;
    const rowX = startX - (count * (boxSize + 2)) / 2 + boxSize / 2;
    for (let i = 0; i < count; i++) {
      const box = new RigidBody({
        position: new Vector2(rowX + i * (boxSize + 2), startY - row * (boxSize + 2)),
        shape: new BoxShape(boxSize, boxSize),
        mass: 1.0,
        restitution: globalRestitution,
        friction: globalFriction,
      });
      world.addBody(box);
    }
  }
});

document.getElementById('btn-preset-cradle')?.addEventListener('click', () => {
  const radius = 20;
  const startX = container.clientWidth / 2 - 100;
  const startY = container.clientHeight / 2;

  for (let i = 0; i < 5; i++) {
    const circle = new RigidBody({
      position: new Vector2(startX + i * (radius * 2.1), startY),
      shape: new CircleShape(radius),
      mass: 1.0,
      restitution: 1.0,
      friction: 0.0,
    });
    if (i === 0) {
      circle.position.x -= 60;
      circle.position.y -= 40;
    }
    world.addBody(circle);
  }
});

document.getElementById('btn-clear')?.addEventListener('click', () => {
  world.clear();
  updateStaticBoundaries(container.clientWidth, container.clientHeight);
});

const pauseBtn = document.getElementById('btn-pause')!;
pauseBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? '▶ Play' : '⏸ Pause';
});

document.getElementById('btn-step')?.addEventListener('click', () => {
  world.step(1 / 60);
});

// Sliders
const gravitySlider = document.getElementById('slider-gravity') as HTMLInputElement;
const gravityVal = document.getElementById('gravity-val')!;
gravitySlider.addEventListener('input', () => {
  const val = parseFloat(gravitySlider.value);
  world.gravity = new Vector2(0, val);
  gravityVal.textContent = val.toFixed(1);
});

const restitutionSlider = document.getElementById('slider-restitution') as HTMLInputElement;
const restitutionVal = document.getElementById('restitution-val')!;
restitutionSlider.addEventListener('input', () => {
  globalRestitution = parseFloat(restitutionSlider.value);
  restitutionVal.textContent = globalRestitution.toFixed(2);
  for (const body of world.bodies) {
    if (!body.isStatic) body.restitution = globalRestitution;
  }
});

const frictionSlider = document.getElementById('slider-friction') as HTMLInputElement;
const frictionVal = document.getElementById('friction-val')!;
frictionSlider.addEventListener('input', () => {
  globalFriction = parseFloat(frictionSlider.value);
  frictionVal.textContent = globalFriction.toFixed(2);
  for (const body of world.bodies) {
    if (!body.isStatic) body.friction = globalFriction;
  }
});

const iterationsSlider = document.getElementById('slider-iterations') as HTMLInputElement;
const iterationsVal = document.getElementById('iterations-val')!;
iterationsSlider.addEventListener('input', () => {
  const val = parseInt(iterationsSlider.value, 10);
  world.iterations = val;
  iterationsVal.textContent = val.toString();
});

// Debug Checkboxes
(document.getElementById('toggle-contacts') as HTMLInputElement).addEventListener('change', (e) => {
  renderOptions.showContactPoints = (e.target as HTMLInputElement).checked;
});
(document.getElementById('toggle-normals') as HTMLInputElement).addEventListener('change', (e) => {
  renderOptions.showNormals = (e.target as HTMLInputElement).checked;
});
(document.getElementById('toggle-velocities') as HTMLInputElement).addEventListener('change', (e) => {
  renderOptions.showVelocities = (e.target as HTMLInputElement).checked;
});

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '▶ Play' : '⏸ Pause';
  } else if (e.code === 'KeyC') {
    world.clear();
    updateStaticBoundaries(container.clientWidth, container.clientHeight);
  }
});

// Initialize
window.addEventListener('resize', resize);
resize();
spawnInitialScene();

// Main Loop
let lastTime = performance.now();
let frameCount = 0;
let lastFpsUpdate = performance.now();

function loop(now: number) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;

  // Mouse drag spring effect
  if (selectedBody && isDragging) {
    const dist = mousePos.sub(selectedBody.position);
    selectedBody.velocity = dist.scale(15); // Drive body towards mouse
  }

  const stepStart = performance.now();
  if (!isPaused) {
    world.step(dt > 0 ? dt : 1 / 60);
  }
  const stepEnd = performance.now();

  renderer.render(world, renderOptions, selectedBody);

  // Update UI Stats
  frameCount++;
  if (now - lastFpsUpdate >= 500) {
    const fps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
    fpsEl.textContent = fps.toString();
    frameCount = 0;
    lastFpsUpdate = now;
  }

  bodiesEl.textContent = world.bodies.length.toString();
  collisionsEl.textContent = world.manifolds.length.toString();
  timeEl.textContent = (stepEnd - stepStart).toFixed(2);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
