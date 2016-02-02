import * as E from './euclid';
//import { Canvas } from './canvas';
import {
  ThreeJS
}
from './threejs';

// * ***********************************************************************
// *
// *   DISK CLASS
// *   Poincare Disk representation of the hyperbolic plane
// *   Contains any functions used to draw to the disk
// *   (Currently using three js as drawing class)
// *************************************************************************
export class Disk {
  constructor() {
    this.draw = new ThreeJS();

    window.addEventListener('load', (event) => {
      window.removeEventListener('load');
      this.init();
    }, false);

    window.addEventListener('resize', () => {
      this.init();
    }, false);

  }

  init() {
    this.centre = {
      x: 0,
      y: 0
    }
    this.radius = (window.innerWidth < window.innerHeight) ? (window.innerWidth / 2) - 5 : (window.innerHeight / 2) - 5;

    //draw largest circle possible given window dims
    this.radius = (window.innerWidth < window.innerHeight) ? (window.innerWidth / 2) - 5 : (window.innerHeight / 2) - 5;

    //smaller circle for testing
    //this.radius = this.radius / 2;

    this.drawDisk();

    //this.testing();
  }

  testing() {
    const p1 = {
      x: 100,
      y: 250
    };
    const p2 = {
      x: -150,
      y: 150
    };
    const p3 = {
      x: -70,
      y: -250
    };

    const p4 = {
      x: -170,
      y: -150
    };

    const p5 = {
      x: 170,
      y: -150
    };
    this.point(p1, 5, 0xf00f0f);
    this.point(p2, 5, 0xffff0f);
    this.point(p3, 5, 0x1d00d5);
    this.point(p4, 5, 0x00ff0f);
    this.point(p5, 5, 0x359543);

    /*
    const a = this.arc(p1, p2);

    this.draw.disk(a.c.centre, a.c.radius, 0xffffff, false);

    const p4 = E.nextPoint(a.c, p2, 20).p1;
    console.log(p4);



    //this.drawArc(p2, p3, 0xf00f0f);
    */
    //this.polygonOutline([p1, p2, p3],0xf00f0f)
    this.polygon([p1, p2, p4, p3, p5], 0x70069a);
    //this.polygon([p2, p3, p4]);
  }
  getRadius(){
    return this.radius;
  }

  //draw the disk background
  drawDisk() {
    this.draw.disk(this.centre, this.radius, 0x000000, true);
  }

  point(centre, radius, color) {
    this.draw.disk(centre, radius, color, false);
  }

  //draw a hyperbolic line between two points on the boundary circle
  //TODO: fix!
  line(p1, p2, colour) {
    const c = E.greatCircle(p1, p2, this.radius, this.centre);
    const points = E.circleIntersect(this.centre, c.centre, this.radius, c.radius);

    this.arc(points.p1, points.p2, colour)
  }

  //Draw an arc (hyperbolic line segment) between two points on the disk
  drawArc(p1, p2, colour) {
    const col = colour || 0xffffff;
    if (E.throughOrigin(p1, p2)) {
      this.draw.line(p1, p2, col);
    } else {
      const arc = this.arc(p1, p2);
      this.draw.segment(arc.c, arc.startAngle, arc.endAngle, colour);
    }
  }

  //calculate greatCircle, startAngle and endAngle for hyperbolic arc
  //TODO deal with case of staight lines through centre
  arc(p1, p2) {
    let clockwise = false;
    //check that the points are in the disk
    if(this.checkPoints(p1, p2)){
      return false
    }
    let alpha1, alpha2, startAngle, endAngle;
    const c = E.greatCircle(p1, p2, this.radius, this.centre);

    const oy = c.centre.y;
    const ox = c.centre.x;

    //point at 0 radians on c
    const p3 = {
      x: ox + c.radius,
      y: oy
    }

    //calculate the position of each point in the circle
    alpha1 = E.centralAngle(p3, p1, c.radius);
    alpha1 = (p1.y < oy) ? 2 * Math.PI - alpha1 : alpha1;
    alpha2 = E.centralAngle(p3, p2, c.radius);
    alpha2 = (p2.y < oy) ? 2 * Math.PI - alpha2 : alpha2;

    //case where p1 above and p2 below the line c.centre -> p3
    if ((p1.x > ox && p2.x > ox) && (p1.y < oy && p2.y > oy)) {
      startAngle = alpha1;
      endAngle = alpha2;
    }
    //case where p2 above and p1 below the line c.centre -> p3
    else if ((p1.x > ox && p2.x > ox) && (p1.y > oy && p2.y < oy)) {
      startAngle = alpha2;
      endAngle = alpha1;
      clockwise = true;
    }
    //points in clockwise order
    else if (alpha1 > alpha2) {
      startAngle = alpha2;
      endAngle = alpha1;
      clockwise = true;
    }
    //points in anticlockwise order
    else {
      startAngle = alpha1;
      endAngle = alpha2;
    }

    return {
      c: c,
      startAngle: startAngle,
      endAngle: endAngle,
      clockwise: clockwise
    }
  }

  polygonOutline(vertices, colour) {
    const l = vertices.length;
    for (let i = 0; i < l; i++) {
      this.drawArc(vertices[i], vertices[(i + 1) % l], colour);
    }
  }

  //create an array of points spaced equally around the arcs defining a hyperbolic
  //polygon and pass these to ThreeJS.polygon()
  //TODO make spacing a function of final resolution
  //TODO check whether vertices are in the right order
  polygon(vertices, color, texture) {
    const points = [];
    const spacing = 5;
    const l = vertices.length;
    for (let i = 0; i < l; i++) {
      let p;
      const a = this.arc(vertices[i], vertices[(i + 1) % l]);

      if(a.clockwise){ p = E.nextPoint(a.c, vertices[i], spacing).p2;}
      else{ p = E.nextPoint(a.c, vertices[i], spacing).p1;}
      points.push(p);

      while(E.distance(p, vertices[(i + 1) % l]) > spacing ){

        if(a.clockwise){ p = E.nextPoint(a.c, p, spacing).p2 }
        else{ p = E.nextPoint(a.c, p, spacing).p1 }

        points.push(p);
      }
      points.push(vertices[(i + 1) % l]);
    }
    this.draw.polygon(points, color, texture);
  }

  //rotate a set of points about a point by a given angle
  rotation(pointsArray, point, angle){

  }

  //reflect a set of points across a hyperbolic arc
  //TODO add case where reflection is across straight line
  reflect(pointsArray, p1, p2){
    const l = pointsArray.length;
    const a = this.arc(p1,p2);
    console.log(a);
    const newPoints = [];
    for(let i =0; i < l; i++){
      newPoints.push(E.inverse(pointsArray[i], a.c.radius, a.c.centre));
    }
    return newPoints;
  }

  //return true if any of the points is not in the disk
  checkPoints(...points) {
    const r = this.radius;
    let test = false;
    for(let point of points){
      if (E.distance(point, this.centre) > r) {
        console.error('Error! Point (' + point.x + ', ' + point.y + ') lies outside the plane!');
        test = true;
      }
    }
    if(test) return true
    else return false
  }
}
