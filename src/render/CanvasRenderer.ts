import { World } from '../dynamics/World';
import { RigidBody } from '../body/RigidBody';
import { CircleShape, BoxShape, PolygonShape } from '../body/Shape';
import { Vector2 } from '../math/Vector2';

export interface RenderOptions {
  showContactPoints?: boolean;
  showNormals?: boolean;
  showVelocities?: boolean;
  theme?: 'dark' | 'neon' | 'paper';
}

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

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

  render(world: World, options: RenderOptions = {}, selectedBody?: RigidBody | null): void {
    const width = parseFloat(this.canvas.style.width || `${this.canvas.width}`);
    const height = parseFloat(this.canvas.style.height || `${this.canvas.height}`);

    // Clear background with dark slate gradient
    const bgGradient = this.ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(1, '#020617');
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, width, height);

    // Grid lines for high-end aesthetic
    this.drawGrid(width, height);

    // Render bodies
    for (const body of world.bodies) {
      this.renderBody(body, body === selectedBody);
    }

    // Render collision manifolds (contact points & normals)
    if (options.showContactPoints || options.showNormals) {
      for (const manifold of world.manifolds) {
        if (options.showContactPoints) {
          for (const contact of manifold.contacts) {
            this.ctx.beginPath();
            this.ctx.arc(contact.x, contact.y, 4, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ef4444';
            this.ctx.fill();
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();
          }
        }

        if (options.showNormals && manifold.contacts.length > 0) {
          const start = manifold.contacts[0];
          const end = start.add(manifold.normal.scale(20));
          this.ctx.beginPath();
          this.ctx.moveTo(start.x, start.y);
          this.ctx.lineTo(end.x, end.y);
          this.ctx.strokeStyle = '#f59e0b';
          this.ctx.lineWidth = 2;
          this.ctx.stroke();
        }
      }
    }

    // Render velocity vectors
    if (options.showVelocities) {
      for (const body of world.bodies) {
        if (body.isStatic || body.velocity.magnitudeSquared() < 1) continue;
        const end = body.position.add(body.velocity.scale(0.2));
        this.ctx.beginPath();
        this.ctx.moveTo(body.position.x, body.position.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
      }
    }
  }

  private drawGrid(width: number, height: number): void {
    const gridSize = 40;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
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

  private renderBody(body: RigidBody, isSelected: boolean): void {
    this.ctx.save();
    this.ctx.translate(body.position.x, body.position.y);
    this.ctx.rotate(body.angle);

    const shape = body.shape;
    let fillColor = body.isStatic ? '#334155' : '#3b82f6';
    let strokeColor = body.isStatic ? '#64748b' : '#60a5fa';

    if (isSelected) {
      fillColor = '#8b5cf6';
      strokeColor = '#a78bfa';
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

      // Draw radius orientation line
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(circle.radius, 0);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
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

      // Orientation indicator dot
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
}
