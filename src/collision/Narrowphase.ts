import { RigidBody } from '../body/RigidBody';
import { CircleShape, BoxShape, PolygonShape } from '../body/Shape';
import { Vector2 } from '../math/Vector2';
import { CollisionManifold } from './CollisionManifold';

export class Narrowphase {
  public static detectCollision(bodyA: RigidBody, bodyB: RigidBody): CollisionManifold | null {
    const typeA = bodyA.shape.type;
    const typeB = bodyB.shape.type;

    if (typeA === 'circle' && typeB === 'circle') {
      return Narrowphase.circleVsCircle(
        bodyA,
        bodyB,
        bodyA.shape as CircleShape,
        bodyB.shape as CircleShape
      );
    } else if (typeA === 'circle' && (typeB === 'box' || typeB === 'polygon')) {
      return Narrowphase.circleVsPolygon(bodyA, bodyB, bodyA.shape as CircleShape);
    } else if ((typeA === 'box' || typeA === 'polygon') && typeB === 'circle') {
      const manifold = Narrowphase.circleVsPolygon(bodyB, bodyA, bodyB.shape as CircleShape);
      if (!manifold) return null;
      // Invert normal so it points from A to B
      return {
        bodyA,
        bodyB,
        normal: manifold.normal.negate(),
        depth: manifold.depth,
        contacts: manifold.contacts
      };
    } else if (
      (typeA === 'box' || typeA === 'polygon') &&
      (typeB === 'box' || typeB === 'polygon')
    ) {
      return Narrowphase.polygonVsPolygon(bodyA, bodyB);
    }

    return null;
  }

  private static circleVsCircle(
    bodyA: RigidBody,
    bodyB: RigidBody,
    circleA: CircleShape,
    circleB: CircleShape
  ): CollisionManifold | null {
    const delta = bodyB.position.sub(bodyA.position);
    const distSq = delta.magnitudeSquared();
    const radiusSum = circleA.radius + circleB.radius;

    if (distSq >= radiusSum * radiusSum) {
      return null;
    }

    const dist = Math.sqrt(distSq);
    let normal: Vector2;
    let depth: number;

    if (dist === 0) {
      normal = new Vector2(1, 0);
      depth = radiusSum;
    } else {
      normal = delta.scale(1 / dist);
      depth = radiusSum - dist;
    }

    const contactPoint = bodyA.position.add(normal.scale(circleA.radius - depth * 0.5));

    return {
      bodyA,
      bodyB,
      normal,
      depth,
      contacts: [contactPoint]
    };
  }

  private static getPolygonVertices(body: RigidBody): Vector2[] {
    if (body.shape.type === 'box') {
      return (body.shape as BoxShape).getVertices(body.position, body.angle);
    } else if (body.shape.type === 'polygon') {
      return (body.shape as PolygonShape).getWorldVertices(body.position, body.angle);
    }
    return [];
  }

  private static polygonVsPolygon(bodyA: RigidBody, bodyB: RigidBody): CollisionManifold | null {
    const vertsA = Narrowphase.getPolygonVertices(bodyA);
    const vertsB = Narrowphase.getPolygonVertices(bodyB);

    let minOverlap = Infinity;
    let smallestAxis: Vector2 = Vector2.zero();

    const axes = [
      ...Narrowphase.getAxes(vertsA),
      ...Narrowphase.getAxes(vertsB)
    ];

    for (const axis of axes) {
      const projA = Narrowphase.project(vertsA, axis);
      const projB = Narrowphase.project(vertsB, axis);

      const overlap = Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min);
      if (overlap <= 0) {
        return null; // Separating axis found
      }

      if (overlap < minOverlap) {
        minOverlap = overlap;
        smallestAxis = axis;
      }
    }

    // Ensure normal points from A to B
    const centerDir = bodyB.position.sub(bodyA.position);
    if (centerDir.dot(smallestAxis) < 0) {
      smallestAxis = smallestAxis.negate();
    }

    const contacts = Narrowphase.findContactPoints(vertsA, vertsB, smallestAxis);

    return {
      bodyA,
      bodyB,
      normal: smallestAxis,
      depth: minOverlap,
      contacts
    };
  }

  private static circleVsPolygon(
    circleBody: RigidBody,
    polyBody: RigidBody,
    circleShape: CircleShape
  ): CollisionManifold | null {
    const polyVerts = Narrowphase.getPolygonVertices(polyBody);
    const center = circleBody.position;

    // Find closest vertex on polygon to circle center
    let closestVert = polyVerts[0];
    let minDistSq = Infinity;
    for (const v of polyVerts) {
      const dSq = center.sub(v).magnitudeSquared();
      if (dSq < minDistSq) {
        minDistSq = dSq;
        closestVert = v;
      }
    }

    // Candidate axes: polygon edge normals + axis to closest vertex
    const axisToClosest = center.sub(closestVert).normalize();
    const axes = [...Narrowphase.getAxes(polyVerts)];
    if (axisToClosest.magnitudeSquared() > 0) {
      axes.push(axisToClosest);
    }

    let minOverlap = Infinity;
    let smallestAxis: Vector2 = Vector2.zero();

    for (const axis of axes) {
      const polyProj = Narrowphase.project(polyVerts, axis);
      const circleDot = center.dot(axis);
      const circleProj = {
        min: circleDot - circleShape.radius,
        max: circleDot + circleShape.radius
      };

      const overlap = Math.min(polyProj.max, circleProj.max) - Math.max(polyProj.min, circleProj.min);
      if (overlap <= 0) {
        return null;
      }

      if (overlap < minOverlap) {
        minOverlap = overlap;
        smallestAxis = axis;
      }
    }

    // Ensure normal points from circleBody to polyBody
    const centerDir = polyBody.position.sub(circleBody.position);
    if (centerDir.dot(smallestAxis) < 0) {
      smallestAxis = smallestAxis.negate();
    }

    const contactPoint = circleBody.position.add(smallestAxis.scale(circleShape.radius - minOverlap * 0.5));

    return {
      bodyA: circleBody,
      bodyB: polyBody,
      normal: smallestAxis,
      depth: minOverlap,
      contacts: [contactPoint]
    };
  }

  private static getAxes(vertices: Vector2[]): Vector2[] {
    const axes: Vector2[] = [];
    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % vertices.length];
      const edge = p2.sub(p1);
      const normal = edge.perpendicular().normalize();
      axes.push(normal);
    }
    return axes;
  }

  private static project(vertices: Vector2[], axis: Vector2): { min: number; max: number } {
    let min = vertices[0].dot(axis);
    let max = min;
    for (let i = 1; i < vertices.length; i++) {
      const p = vertices[i].dot(axis);
      if (p < min) min = p;
      if (p > max) max = p;
    }
    return { min, max };
  }

  private static findContactPoints(vertsA: Vector2[], vertsB: Vector2[], normal: Vector2): Vector2[] {
    const contacts: Vector2[] = [];
    // Simple contact point approximation: support points
    let minA = Infinity;
    let maxSupportA: Vector2 = vertsA[0];
    for (const v of vertsA) {
      const proj = v.dot(normal);
      if (proj > minA || minA === Infinity) {
        minA = proj;
        maxSupportA = v;
      }
    }

    let minB = Infinity;
    let minSupportB: Vector2 = vertsB[0];
    for (const v of vertsB) {
      const proj = v.dot(normal);
      if (proj < minB || minB === Infinity) {
        minB = proj;
        minSupportB = v;
      }
    }

    contacts.push(maxSupportA.add(minSupportB).scale(0.5));
    return contacts;
  }
}
