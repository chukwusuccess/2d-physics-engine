import React, { useEffect, useRef, useState } from 'react';
import { World, CanvasRenderer, RigidBody, CircleShape, BoxShape, Vector2 } from '@engine';
import { useStudioStore } from '../../store/useStudioStore';
import { Play, Pause, FastForward, Clock, ArrowsDownUp } from '@phosphor-icons/react';


interface CanvasViewportProps {
  onEngineReady?: (world: World, renderer: CanvasRenderer) => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const worldRef = useRef<World>(new World());
  const rendererRef = useRef<CanvasRenderer | null>(null);

  const [fps, setFps] = useState(60);
  const [bodiesCount, setBodiesCount] = useState(0);
  const [collisionsCount, setCollisionsCount] = useState(0);
  const [solverTime, setSolverTime] = useState(0.2);

  const store = useStudioStore();

  // Mouse interaction state
  const selectedBodyRef = useRef<RigidBody | null>(null);
  const isDraggingRef = useRef(false);
  const mousePosRef = useRef<Vector2>(Vector2.zero());
  const lastMousePosRef = useRef<Vector2>(Vector2.zero());

  // Static boundary management
  const floorRef = useRef<RigidBody | null>(null);
  const leftWallRef = useRef<RigidBody | null>(null);
  const rightWallRef = useRef<RigidBody | null>(null);

  const updateBoundaries = (width: number, height: number) => {
    const world = worldRef.current;
    if (floorRef.current) world.removeBody(floorRef.current);
    if (leftWallRef.current) world.removeBody(leftWallRef.current);
    if (rightWallRef.current) world.removeBody(rightWallRef.current);

    const thickness = 60;
    floorRef.current = new RigidBody({
      position: new Vector2(width / 2, height + thickness / 2 - 20),
      shape: new BoxShape(width + 200, thickness),
      isStatic: true,
      restitution: store.restitution,
      friction: store.friction,
    });

    leftWallRef.current = new RigidBody({
      position: new Vector2(-thickness / 2 + 10, height / 2),
      shape: new BoxShape(thickness, height * 2),
      isStatic: true,
      restitution: store.restitution,
      friction: store.friction,
    });

    rightWallRef.current = new RigidBody({
      position: new Vector2(width + thickness / 2 - 10, height / 2),
      shape: new BoxShape(thickness, height * 2),
      isStatic: true,
      restitution: store.restitution,
      friction: store.friction,
    });

    world.addBody(floorRef.current);
    world.addBody(leftWallRef.current);
    world.addBody(rightWallRef.current);
  };

  // Sync store settings to world
  useEffect(() => {
    worldRef.current.gravity = new Vector2(0, store.gravityY);
    worldRef.current.iterations = store.iterations;
    for (const body of worldRef.current.bodies) {
      if (!body.isStatic) {
        body.restitution = store.restitution;
        body.friction = store.friction;
      }
    }
  }, [store.gravityY, store.restitution, store.friction, store.iterations]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    rendererRef.current = new CanvasRenderer(canvas);

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      rendererRef.current?.resize(w, h);
      updateBoundaries(w, h);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Spawn initial scene
    const w = container.clientWidth;
    const h = container.clientHeight;
    const boxSize = 36;
    const startX = w / 2;
    const startY = h - 80;

    for (let i = 0; i < 6; i++) {
      const box = new RigidBody({
        position: new Vector2(startX + (Math.random() * 2 - 1), startY - i * (boxSize + 2)),
        shape: new BoxShape(boxSize, boxSize),
        mass: 1.5,
        restitution: 0.6,
        friction: 0.3,
      });
      worldRef.current.addBody(box);
    }

    for (let i = 0; i < 5; i++) {
      const radius = 16 + Math.random() * 12;
      const circle = new RigidBody({
        position: new Vector2(startX - 160 + i * 42, 100 + i * 30),
        shape: new CircleShape(radius),
        mass: radius * 0.1,
        restitution: 0.8,
        friction: 0.3,
      });
      worldRef.current.addBody(circle);
    }

    // Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const loop = (now: number) => {
      let dt = Math.min((now - lastTime) / 1000, 0.033);
      if (useStudioStore.getState().isSlowMo) dt *= 0.25;
      lastTime = now;

      // Mouse drag spring velocity
      if (selectedBodyRef.current && isDraggingRef.current) {
        const dist = mousePosRef.current.sub(selectedBodyRef.current.position);
        selectedBodyRef.current.velocity = dist.scale(15);
      }

      const stepStart = performance.now();
      if (!useStudioStore.getState().isPaused) {
        worldRef.current.step(dt > 0 ? dt : 1 / 60);
      }
      const stepEnd = performance.now();

      const currentState = useStudioStore.getState();
      rendererRef.current?.render(
        worldRef.current,
        {
          showContactPoints: currentState.showContacts,
          showNormals: currentState.showNormals,
          showVelocities: currentState.showVelocities,
          showTrails: currentState.showTrails,
          theme: currentState.theme,
        },
        selectedBodyRef.current
      );

      frameCount++;
      if (now - lastFpsUpdate >= 500) {
        setFps(Math.round((frameCount * 1000) / (now - lastFpsUpdate)));
        frameCount = 0;
        lastFpsUpdate = now;
      }

      setBodiesCount(worldRef.current.bodies.length);
      setCollisionsCount(worldRef.current.manifolds.length);
      setSolverTime(parseFloat((stepEnd - stepStart).toFixed(2)));

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Mouse Listeners
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mousePosRef.current = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
    lastMousePosRef.current = mousePosRef.current.clone();

    const bodies = worldRef.current.bodies;
    for (let i = bodies.length - 1; i >= 0; i--) {
      const body = bodies[i];
      if (body.isStatic) continue;

      if (isPointInsideBody(mousePosRef.current, body)) {
        selectedBodyRef.current = body;
        isDraggingRef.current = true;
        break;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    lastMousePosRef.current = mousePosRef.current.clone();
    mousePosRef.current = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseUp = () => {
    if (selectedBodyRef.current && isDraggingRef.current) {
      const throwVel = mousePosRef.current.sub(lastMousePosRef.current).scale(20);
      selectedBodyRef.current.velocity = throwVel;
    }
    selectedBodyRef.current = null;
    isDraggingRef.current = false;
  };

  return (
    <main ref={containerRef} className="flex-1 relative h-full bg-slate-950">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-full block cursor-crosshair"
      />

      {/* Top-Right Telemetry HUD */}
      <div className="absolute top-4 right-4 bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-xl p-3 flex gap-4 font-mono z-10 shadow-lg">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase text-slate-500 font-semibold">FPS</span>
          <span className="text-sm font-semibold text-sky-400">{fps}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase text-slate-500 font-semibold">Bodies</span>
          <span className="text-sm font-semibold text-sky-400">{bodiesCount}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase text-slate-500 font-semibold">Collisions</span>
          <span className="text-sm font-semibold text-sky-400">{collisionsCount}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase text-slate-500 font-semibold">Solve (ms)</span>
          <span className="text-sm font-semibold text-sky-400">{solverTime}</span>
        </div>
      </div>

      {/* Floating Bottom HUD */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-md border border-white/15 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-2xl z-10">
        <button
          onClick={store.togglePaused}
          className="px-3 py-1.5 rounded-full hover:bg-white/10 text-xs font-medium text-slate-200 flex items-center gap-1.5 active:scale-95 transition-all duration-150"
        >
          {store.isPaused ? <Play size={14} weight="fill" /> : <Pause size={14} weight="fill" />}
          <span>{store.isPaused ? 'Play' : 'Pause'}</span>
        </button>

        <button
          onClick={() => worldRef.current.step(1 / 60)}
          className="px-3 py-1.5 rounded-full hover:bg-white/10 text-xs font-medium text-slate-200 flex items-center gap-1.5 active:scale-95 transition-all duration-150"
        >
          <FastForward size={14} />
          <span>Step</span>
        </button>

        <div className="w-[1px] h-5 bg-white/10" />

        <button
          onClick={store.toggleSlowMo}
          className={`px-3 py-1.5 rounded-full hover:bg-white/10 text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all duration-150 ${
            store.isSlowMo ? 'text-sky-400 font-semibold' : 'text-slate-200'
          }`}
        >
          <Clock size={14} />

          <span>Slow-Mo</span>
        </button>

        <button
          onClick={store.invertGravity}
          className="px-3 py-1.5 rounded-full hover:bg-white/10 text-xs font-medium text-slate-200 flex items-center gap-1.5 active:scale-95 transition-all duration-150"
        >
          <ArrowsDownUp size={14} />
          <span>Invert G</span>
        </button>
      </div>
    </main>
  );
};

function isPointInsideBody(point: Vector2, body: RigidBody): boolean {
  const shape = body.shape;
  if (shape.type === 'circle') {
    const distSq = point.sub(body.position).magnitudeSquared();
    return distSq <= (shape as CircleShape).radius * (shape as CircleShape).radius;
  } else if (shape.type === 'box') {
    const box = shape as BoxShape;
    const verts = box.getVertices(body.position, body.angle);
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
