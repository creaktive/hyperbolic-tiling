import * as E from './euclid';
import * as H from './hyperbolic';

// * ***********************************************************************
// *
// *   HYPERBOLIC ELEMENT CLASSES
// *
// *************************************************************************


// * ***********************************************************************
// *
// *   POINT CLASS
// *   2d point class
// *************************************************************************

export class Point {
  constructor(x, y) {
    if (E.toFixed(x, 10) == 0) {
      x = 0;
    }
    if (E.toFixed(y, 10) == 0) {
      y = 0;
    }
    this.x = x;
    this.y = y;
  }

  toFixed(places) {
    this.x = E.toFixed(this.x, places);
    this.y = E.toFixed(this.y, places);
  }

  //compare two points taking rounding errors into account
  compare(p2) {
    if (typeof p2 === 'undefined') {
      console.warn('Warning: point not defined.')
      return false;
    }
    const t1 = this.toFixed(10);
    const t2 = p2.toFixed(10);

    if (p1.x === p2.x && p1.y === p2.y) return true;
    else return false;
  }

  //map from disk of currentRadius to unit disk
  toUnitDisk(currentRadius) {
    return new Point(this.x / currentRadius, this.y / currentRadius);
  }

  //map from unit disk to disk of newRadius
  fromUnitDisk(newRadius) {
    return new Point(this.x * newRadius, this.y * newRadius);
  }

}

// * ***********************************************************************
// *
// *   CIRCLE CLASS
// *
// *************************************************************************

export class Circle {
  constructor(centreX, centreY, radius) {
    if (E.toFixed(radius) == 0) {
      radius = 0;
    }
    this.centre = new Point(centreX, centreY);
    this.radius = radius;
  }
}

// * ***********************************************************************
// *
// *   ARC CLASS
// *
// *************************************************************************

export class Arc {
  constructor(p1, p2, circle) {
    if (E.throughOrigin(p1, p2)) {
      this.circle = circle;
      this.startAngle = 0;
      this.endAngle = 0;
      this.clockwise = false;
      this.straightLine = true;
    }
    else{
      const q1 = p1.toUnitDisk(circle.radius);
      const q2 = p2.toUnitDisk(circle.radius);

      const wp1 = H.poincareToWeierstrass(q1);
      const wp2 = H.poincareToWeierstrass(q2);

      const wcp = H.weierstrassCrossProduct(wp1, wp2);

      const arcCentre = new Point(wcp.x / wcp.z, wcp.y / wcp.z);

      //calculate centre of arcCircle relative to unit disk
      const cx = wcp.x / wcp.z;
      const cy = wcp.y / wcp.z;

      //translate points to origin before calculating arctan
      q1.x = q1.x - arcCentre.x;
      q1.y = q1.y - arcCentre.y;
      q2.x = q2.x - arcCentre.x;
      q2.y = q2.y - arcCentre.y;

      const r = Math.sqrt((q1.x * q1.x) + (q1.y * q1.y));
      const arcCircle = new Circle(arcCentre.x * circle.radius, arcCentre.y * circle.radius, r * circle.radius);

      let alpha = Math.atan2(q1.y, q1.x);

      let beta = Math.atan2(q2.y, q2.x);

      //angles are in (-pi, pi), transform to (0,2pi)
      alpha = (alpha < 0) ? 2 * Math.PI + alpha : alpha;
      beta = (beta < 0) ? 2 * Math.PI + beta : beta;

      const cw = E.clockwise(alpha, beta);
      if (cw) {
        this.startAngle = alpha;
        this.endAngle = beta;
      } else {
        this.startAngle = beta;
        this.endAngle = alpha;
      }

      this.circle = arcCircle;
      this.clockwise = cw;
      this.straightLine = false;
    }
  }
}

// * ***********************************************************************
// *
// *   POLYGON CLASS
// *
// *************************************************************************

//@param vertices: array of Points
//@param circle: Circle representing current Poincare Disk dimensions
export class Polygon {
  constructor(vertices, circle) {
    this.vertices = vertices;
    this.circle = circle;
    this.points = [];

    this.spacedPointsOnEdges();
  }

  //TODO: make spacing function of resolution
  spacedPointsOnEdges(){
    const spacing = 5;
    const l = this.vertices.length;
    for (let i = 0; i < l; i++) {
      const arc = new Arc(this.vertices[i], this.vertices[(i + 1) % l], this.circle);

      //line not through the origin (hyperbolic arc)
      if (!arc.straightLine) {
        let p;
        if(!arc.clockwise) p = E.spacedPointOnArc(arc.circle, this.vertices[i], spacing).p2;
        else p = E.spacedPointOnArc(arc.circle, this.vertices[i], spacing).p1;
        this.points.push(p);

        while (E.distance(p, this.vertices[(i + 1) % l]) > spacing) {
          if(!arc.clockwise){
            p = E.spacedPointOnArc(arc.circle, p, spacing).p2;
          }
          else{
            p = E.spacedPointOnArc(arc.circle, p, spacing).p1;
          }
          this.points.push(p);
        }

        this.points.push(this.vertices[(i + 1) % l]);
      }

      //line through origin (straight line)
      else{
        this.points.push(this.vertices[(i + 1) % l]);
      }
    }
  }

  //reflect vertices of the polygon over the arc defined by p1, p1
  //and create a new polygon from the reflected vertices
  //NOTE: reflect vertices rather than all points on edge as the
  //resulting polygon may be smaller or larger so it makes more sense
  //to recalculate the points
  reflect(p1, p2){
    const a = new Arc(p1, p2, this.circle);
    const vertices = [];

    if (!a.straightLine) {
      for (let v of this.vertices) {
        vertices.push(E.inverse(v, a.circle));
      }
    } else {
      for (let v of this.vertices) {
        vertices.push(E.lineReflection(p1, p2, v));
      }
    }
    return new Polygon(vertices, this.circle);
  }

  rotateAboutOrigin(angle){
    const vertices = [];
    for (let v of this.vertices) {
      let point = E.rotatePointAboutOrigin(v, angle);
      vertices.push(point);
    }
    return new Polygon(vertices, this.circle);
  }

}
