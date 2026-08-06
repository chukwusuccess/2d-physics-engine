import { World } from '../dynamics/World';
import { RigidBody } from '../body/RigidBody';
import { CircleShape, BoxShape, PolygonShape } from '../body/Shape';
import { Vector2 } from '../math/Vector2';

export interface RenderOptions {
  showContactPoints?: boolean;
  showNormals?: boolean;
  showVelocities?: boolean;
  showTrails?: boolean;
  showGrid?: boolean;
  theme?: 'neon' | 'cyan' | 'monochrome';
}

interface SparkParticle {
  position: Vector2;
  velocity: Vector2;
  life: number;
  maxLife: number;
  color: string;
}

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private particles: SparkParticle[] = [];
  private trails: Map<RigidBody, Vector2[]> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to get 2D context');
    this.ctx = context;
  }

  resize(width: number, height: number): void {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(dpr, dpr);
  }

  addSparks(contacts: Vector2[], intensity: number = 3): void {
    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#ec4899', '#38bdf8'];
    for (const pt of contacts) {
      for (let i = 0; i < intensity; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 80;
        this.particles.push({
          position: pt.clone(),
          velocity: new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed),
          life: 1.0,
          maxLife: 0.25 + Math.random() * 0.2,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }
  }

  render(world: World, options: RenderOptions = {}, selectedBody?: RigidBody | null): void {
    const width = parseFloat(this.canvas.style.width || `${this.canvas.width}`);
    const height = parseFloat(this.canvas.style.height || `${this.canvas.height}`);

    // Sleek dark-tech background
    const bgGradient = this.ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#0a0f1d');
    bgGradient.addColorStop(1, '#020617');
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, width, height);

    // Subtle background grid
    if (options.showGrid !== false) {
      this.drawGrid(width, height);
    }

    // Spawn sparks on active collisions
    if (world.manifolds.length > 0) {
      for (const m of world.manifolds) {
        const relVelSq = m.bodyA.velocity.sub(m.bodyB.velocity).magnitudeSquared();
        if (relVelSq > 400) {
          this.addSparks(m.contacts, 2);
        }
      }
    }

    // Render Trails
    if (options.showTrails) {
      this.renderTrails(world);
    }

    // Render Bodies
    for (const body of world.bodies) {
      this.renderBody(body, body === selectedBody, options.theme || 'neon');
    }

    // Render Collision Manifolds (Contact Points & Normals)
    if (options.showContactPoints || options.showNormals) {
      for (const manifold of world.manifolds) {
        if (options.showContactPoints) {
          for (const contact of manifold.contacts) {
            // Glow effect
            this.ctx.shadowColor = '#ef4444';
            this.ctx.shadowBlur = 8;
            this.ctx.beginPath();
            this.ctx.arc(contact.x, contact.y, 4, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ef4444';
            this.ctx.fill();
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
          }
        }

        if (options.showNormals && manifold.contacts.length > 0) {
          const start = manifold.contacts[0];
          const end = start.add(manifold.normal.scale(22));
          this.ctx.beginPath();
          this.ctx.moveTo(start.x, start.y);
          this.ctx.lineTo(end.x, end.y);
          this.ctx.strokeStyle = '#f59e0b';
          this.ctx.lineWidth = 2;
          this.ctx.stroke();

          // Arrow head
          const arrowSize = 5;
          const normalAngle = Math.atan2(manifold.normal.y, manifold.normal.x);
          this.ctx.beginPath();
          this.ctx.moveTo(end.x, end.y);
          this.ctx.lineTo(
            end.x - arrowSize * Math.cos(normalAngle - Math.PI / 6),
            end.y - arrowSize * Math.sin(normalAngle - Math.PI / 6)
          );
          this.ctx.lineTo(
            end.x - arrowSize * Math.cos(normalAngle + Math.PI / 6),
            end.y - arrowSize * Math.sin(normalAngle + Math.PI / 6)
          );
          this.ctx.fillStyle = '#f59e0b';
          this.ctx.fill();
        }
      }
    }

    // Render Velocity Vectors
    if (options.showVelocities) {
      for (const body of world.bodies) {
        if (body.isStatic || body.velocity.magnitudeSquared() < 4) continue;
        const end = body.position.add(body.velocity.scale(0.25));
        this.ctx.beginPath();
        this.ctx.moveTo(body.position.x, body.position.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    }

    // Update & Render Sparks
    this.updateAndRenderParticles(0.016);

    // Selected Body Inspector Callout
    if (selectedBody) {
      this.renderInspectorBadge(selectedBody);
    }
  }

  private drawGrid(width: number, height: number): void {
    const gridSize = 40;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    this.ctx.lineWidth = 1;

    this.ctx.beginPath();
    for (let x = 0; x <= width; x += gridSize) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
    }
    this.ctx.stroke();
  }

  private renderTrails(world: World): void {
    for (const body of world.bodies) {
      if (body.isStatic) continue;

      let points = this.trails.get(body);
      if (!points) {
        points = [];
        this.trails.set(body, points);
      }

      points.push(body.position.clone());
      if (points.length > 25) points.shift();

      if (points.length > 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
      }
    }
  }

  private renderBody(body: RigidBody, isSelected: boolean, theme: string): void {
    this.ctx.save();
    this.ctx.translate(body.position.x, body.position.y);
    this.ctx.rotate(body.angle);

    const shape = body.shape;
    let fillColor = body.isStatic ? '#1e293b' : '#3b82f6';
    let strokeColor = body.isStatic ? '#475569' : '#60a5fa';

    if (theme === 'cyan') {
      fillColor = body.isStatic ? '#0f2942' : '#06b6d4';
      strokeColor = body.isStatic ? '#1e4976' : '#22d3ee';
    } else if (theme === 'monochrome') {
      fillColor = body.isStatic ? '#27272a' : '#71717a';
      strokeColor = body.isStatic ? '#52525b' : '#a1a1aa';
    }

    if (isSelected) {
      fillColor = '#8b5cf6';
      strokeColor = '#c084fc';
      this.ctx.shadowColor = '#8b5cf6';
      this.ctx.shadowBlur = 12;
    }

    if (shape.type === 'circle') {
      const circle = shape as CircleShape;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, circle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = fillColor;
      this.ctx.fill();
      this.ctx.lineWidth = isSelected ? 3 : 2;
      this.ctx.strokeStyle = strokeColor;
      this.ctx.stroke();

      // Radius line
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(circle.radius, 0);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    } else if (shape.type === 'box') {
      const box = shape as BoxShape;
      const hw = box.width / 2;
      const hh = box.height / 2;

      this.ctx.beginPath();
      this.ctx.rect(-hw, -hh, box.width, box.height);
      this.ctx.fillStyle = fillColor;
      this.ctx.fill();
      this.ctx.lineWidth = isSelected ? 3 : 2;
      this.ctx.strokeStyle = strokeColor;
      this.ctx.stroke();

      // Indicator dot
      this.ctx.beginPath();
      this.ctx.arc(hw * 0.6, 0, 3, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.fill();
    } else if (shape.type === 'polygon') {
      const poly = shape as PolygonShape;
      if (poly.vertices.length > 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(poly.vertices[0].x, poly.vertices[0].y);
        for (let i = 1; i < poly.vertices.length; i++) {
          this.ctx.lineTo(poly.vertices[i].x, poly.vertices[i].y);
        }
        this.ctx.closePath();
        this.ctx.fillStyle = fillColor;
        this.ctx.fill();
        this.ctx.lineWidth = isSelected ? 3 : 2;
        this.ctx.strokeStyle = strokeColor;
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }

  private updateAndRenderParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt / p.maxLife;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.position = p.position.add(p.velocity.scale(dt));
      const radius = 2.5 * p.life;

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 6;
      this.ctx.beginPath();
      this.ctx.arc(p.position.x, p.position.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  private renderInspectorBadge(body: RigidBody): void {
    const x = body.position.x + 30;
    const y = body.position.y - 40;

    const vel = body.velocity.magnitude().toFixed(1);
    const angVel = body.angularVelocity.toFixed(2);
    const text = `V: ${vel} px/s  |  ω: ${angVel} rad/s`;

    this.ctx.save();
    this.ctx.font = '500 11px "JetBrains Mono", monospace';
    const textWidth = this.ctx.measureText(text).width;

    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(x, y - 16, textWidth + 16, 24, 6);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillText(text, x + 8, y);
    this.ctx.restore();
  }
}
