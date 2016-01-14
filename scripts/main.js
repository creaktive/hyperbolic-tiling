(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// * ***********************************************************************
// *
// *   PRE-SETUP
// *
// *************************************************************************

document.write('<canvas id="canvas" width="' + window.innerWidth + '" height="' + window.innerHeight + '"> \
  <h1> Canvas doesn\'t seem to be working! </h1> \
</canvas>');

// * ***********************************************************************
// *
// *   CONSTANTS
// *   define any global constants here
// *
// *************************************************************************

// * ***********************************************************************
// *
// *   HELPER FUNCTIONS
// *   define any global helper functions here
// *
// *************************************************************************
//solve quadratic eq based -b^2... formula
var quadratic = function quadratic(a, b, c) {
  if (c === 0) return 0;
  var body = b * b - 4 * a * c;
  if (body < 0) return 0;

  var pos = (-b + Math.sqrt(body)) / (2 * c);
  var neg = (-b - Math.sqrt(body)) / (2 * c);

  return {
    pos: pos,
    neg: neg
  };
};

//distance between two points
var distance = function distance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

//midpoint of the line segment connecting two points
var midpoint = function midpoint(p1, p2) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  };
};

//slope of line through p1, p2
var slope = function slope(p1, p2) {
  return (p2.x - p1.x) / (p2.y - p1.y);
};

//slope of line perpendicular to a line defined by p1,p2
var perpendicularSlope = function perpendicularSlope(p1, p2) {
  return -1 / Math.pow(slope(p1, p2), -1);
};

//intersection point of two lines defined by p1,m1 and q1,m2
var intersection = function intersection(p1, m1, p2, m2) {
  //y intercept of first line
  var c1 = p1.y - m1 * p1.x;
  //y intercept of second line
  var c2 = p2.y - m2 * p2.x;

  var x = (c2 - c1) / (m1 - m2);
  var y = m1 * x + c1;
  return {
    x: x,
    y: y
  };
};

var radians = function radians(degrees) {
  return Math.PI / 180 * degrees;
};

//get the inverse of a point p with respect a circle radius r centre c
var inverse = function inverse(p, r, c) {
  var alpha = r * r / (Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2));
  return {
    x: alpha * (p.x - c.x) + c.x,
    y: alpha * (p.y - c.y) + c.y
  };
};

//calculate the radius and centre of the circle required to draw a line between
//two points in the hyperbolic plane defined by the circle r, c
var greatCircle = function greatCircle(p1, p2, r, c) {
  var p1Inverse = inverse(p1, r, c);
  var p2Inverse = inverse(p2, r, c);

  var m = midpoint(p1, p1Inverse);
  var n = midpoint(p2, p2Inverse);

  var m1 = perpendicularSlope(m, p1Inverse);
  var m2 = perpendicularSlope(n, p2Inverse);

  //centre is the centrepoint of the circle out of which the arc is made
  var centre = intersection(m, m1, n, m2);
  var radius = distance(centre, p1);

  return { centre: centre, radius: radius };
};

//intersection of two circles with equations:
//(x-a)^2 +(y-a)^2 = r0^2
//(x-b)^2 +(y-c)^2 = r1^2
//NOTE assumes the two circles DO intersect!
var circleIntersect = function circleIntersect(c0, c1, r0, r1) {
  var a = c0.x;
  var b = c0.y;
  var c = c1.x;
  var d = c1.y;
  var dist = Math.sqrt((c - a) * (c - a) + (d - b) * (d - b));

  var del = Math.sqrt((dist + r0 + r1) * (dist + r0 - r1) * (dist - r0 + r1) * (-dist + r0 + r1)) / 4;

  var xPartial = (a + c) / 2 + (c - a) * (r0 * r0 - r1 * r1) / (2 * dist * dist);
  var x1 = xPartial - 2 * del * (b - d) / (dist * dist);
  var x2 = xPartial + 2 * del * (b - d) / (dist * dist);

  var yPartial = (b + d) / 2 + (d - b) * (r0 * r0 - r1 * r1) / (2 * dist * dist);
  var y1 = yPartial + 2 * del * (a - c) / (dist * dist);
  var y2 = yPartial - 2 * del * (a - c) / (dist * dist);

  var p1 = {
    x: x1,
    y: y1
  };

  var p2 = {
    x: x2,
    y: y2
  };

  return { p1: p1, p2: p2 };
};

//angle at centre of circle radius r give two points on circumferece
var arcLength = function arcLength(p1, p2, r) {
  return 2 * Math.asin(0.5 * distance(p1, p2) / r);
};

// * ***********************************************************************
// *
// *   DOCUMENT READY
// *
// *************************************************************************
$(document).ready(function () {

  // * ***********************************************************************
  // *
  // *  ELEMENTS CLASS
  // *  Holds references to any elements used
  // *
  // *************************************************************************

  var Elements = function Elements() {
    _classCallCheck(this, Elements);

    this.canvas = $('#canvas')[0];
    this.ctx = this.canvas.getContext('2d');
  };

  var elems = new Elements();

  // * ***********************************************************************
  // *
  // *  DIMENSIONS CLASS
  // *  Hold references to any dimensions used in calculations and
  // *  recalculate as needed (e.g. on window resize)
  // *
  // *************************************************************************

  var Dimensions = function () {
    function Dimensions() {
      var _this = this;

      _classCallCheck(this, Dimensions);

      //set the dimensions on load
      this.setDims();

      $(window).resize(function () {
        //reset the dimensions on window resize
        _this.setDims();
      });
    }

    _createClass(Dimensions, [{
      key: 'setDims',
      value: function setDims() {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
      }
    }]);

    return Dimensions;
  }();

  var dims = new Dimensions();

  // * ***********************************************************************
  // *
  // *   LAYOUT CLASS
  // *   overall layout set up goes here
  // *
  // *************************************************************************

  var Layout = function Layout() {
    _classCallCheck(this, Layout);

    $(window).resize(function () {});
  };

  var layout = new Layout();

  // * ***********************************************************************
  // *
  // *   DISK CLASS
  // *   Poincare Disk representation of the hyperbolic plane
  // *
  // *************************************************************************

  var Disk = function () {
    function Disk() {
      _classCallCheck(this, Disk);

      this.x = dims.windowWidth / 2;
      this.y = dims.windowHeight / 2;

      //transform the canvas so the origin is at the centre of the disk
      elems.ctx.translate(this.x, this.y);

      this.centre = {
        x: 0,
        y: 0
      };

      //draw largest circle possible given window dims
      this.radius = dims.windowWidth < dims.windowHeight ? dims.windowWidth / 2 - 5 : dims.windowHeight / 2 - 5;

      //smaller circle for testing
      this.radius = this.radius / 2;

      this.color = 'black';
    }

    _createClass(Disk, [{
      key: 'outerCircle',
      value: function outerCircle() {
        elems.ctx.beginPath();
        elems.ctx.arc(this.centre.x, this.centre.y, this.radius, 0, Math.PI * 2);
        elems.ctx.strokeStyle = this.color;
        elems.ctx.stroke();
      }
    }, {
      key: 'circle',
      value: function circle(c, r, colour) {
        var col = colour || 'black';
        elems.ctx.beginPath();
        elems.ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        elems.ctx.strokeStyle = col;
        elems.ctx.stroke();
      }

      //draw a point on the disk, optional radius and colour

    }, {
      key: 'point',
      value: function point(_point, radius, colour) {
        var c = colour || 'black';
        var r = radius || 2;
        elems.ctx.beginPath();
        elems.ctx.arc(_point.x, _point.y, r, 0, Math.PI * 2, true);
        elems.ctx.fillStyle = c;
        elems.ctx.fill();
      }

      //draw a hyperbolic line between two points

    }, {
      key: 'line',
      value: function line(p1, p2, colour) {
        if (this.checkPoint(p1) || this.checkPoint(p2)) {
          return;
        }
        var col = colour || 'black';
        var c = greatCircle(p1, p2, this.radius, this.centre);

        var points = circleIntersect(this.centre, c.centre, this.radius, c.radius);

        this.point(points.p1);
        this.point(points.p2);

        //angle subtended by the arc
        var alpha = arcLength(points.p1, points.p2, c.radius);

        var offset = this.alphaOffset(points.p2, points.p2, c);
        this.drawSegment(c, alpha, offset, col);
      }

      //Draw an arc (hyperbolic line segment) between two points on the disk

    }, {
      key: 'arc',
      value: function arc(p1, p2, colour) {
        if (this.checkPoint(p1) || this.checkPoint(p2)) {
          return;
        }
        var col = colour || 'black';
        var c = greatCircle(p1, p2, this.radius, this.centre);

        var alpha = arcLength(p1, p2, c.radius);

        var offset = this.alphaOffset(p1, p2, c);
        this.drawSegment(c, alpha, offset, col);
      }
    }, {
      key: 'polygon',
      value: function polygon(pointsArray, colour) {
        console.log(pointsArray);
        var l = pointsArray.length;
        for (var i = 0; i < l - 1; i++) {
          this.arc(pointsArray[i], pointsArray[i + 1], colour);
        }
        //close the polygon
        this.arc(pointsArray[0], pointsArray[l - 1], colour);
      }

      //calculate the offset (position around the circle from which to start the
      //line or arc). As canvas draws arcs clockwise by default this will change
      //depending on where the arc is relative to the origin

    }, {
      key: 'alphaOffset',
      value: function alphaOffset(p1, p2, circle) {
        //a point at 0 radians on the circle
        //let temp = (c.centre.x < 0)? c.centre.x + c.radius : c.centre.x - c.radius;
        var p = {
          x: circle.centre.x + circle.radius,
          y: circle.centre.y
        };
        var offset = undefined;

        if (p1.y < 0 && p2.y < 0) {
          offset = -arcLength(p2, p, circle.radius);
          if (p2.x > 0) {
            offset = -offset;
          }
        } else {
          offset = -arcLength(p1, p, circle.radius);
          if (p1.x > 0) {
            offset = -offset;
          }
        }

        return offset;
      }

      //draw a hyperbolic line segment using calculations from line() or arc()

    }, {
      key: 'drawSegment',
      value: function drawSegment(c, alpha, alphaOffset, colour) {
        elems.ctx.beginPath();
        elems.ctx.arc(c.centre.x, c.centre.y, c.radius, alphaOffset, alpha + alphaOffset);
        elems.ctx.strokeStyle = colour || 'black';
        elems.ctx.stroke();
      }

      //is the point in the disk?

    }, {
      key: 'checkPoint',
      value: function checkPoint(p) {
        var r = this.radius;
        if (distance(p, this.centre) > r) {
          console.error('Error! Point (' + p.x + ', ' + p.y + ') lies outside the plane!');
          return true;
        }
        return false;
      }
    }]);

    return Disk;
  }();

  var disk = new Disk();

  // * ***********************************************************************
  // *
  // *   CANVAS CLASS
  // *
  // *
  // *************************************************************************

  var Canvas = function () {
    function Canvas() {
      _classCallCheck(this, Canvas);

      this.draw();
      $(window).resize(function () {
        //this.clear();
        //this.draw();
      });
    }

    _createClass(Canvas, [{
      key: 'draw',
      value: function draw() {
        disk.outerCircle();
        disk.point(disk.centre);

        //left of centre, vertical
        //this.testPoints(-60,-100,-60,120, 'green', 'red');
        //right of centre, vertical
        //this.testPoints(60,-100,60,120, 'green', 'red');
        //above centre, horizontal
        //this.testPoints(-90,-100,100,-100, 'green', 'red');
        //below centre, horizontal
        //this.testPoints(-120,100,120,100, 'green', 'red');
        //bottom right to top left
        //this.testPoints(120,100,-120,-120, 'green', 'red');

        //bottom left to top right
        //this.testPoints(-120,100,120,-120, 'green', 'red');
        //top left to bottom right
        //this.testPoints(-60,-60,100,60, 'green', 'red');

        //through centre, horizontal
        //this.testPoints(-60,0,60,0, 'green', 'red');
        //through centre, vertical
        //this.testPoints(-0,-100,0,100, 'green', 'red');

        var p1 = { x: -60, y: -100 };
        var p2 = { x: -60, y: 120 };
        var p3 = { x: 60, y: 100 };
        var p4 = { x: 60, y: -120 };

        disk.polygon([p1, p2, p3, p4]);
      }
    }, {
      key: 'testPoints',
      value: function testPoints(x1, y1, x2, y2, col1, col2) {
        var p1 = {
          x: x1,
          y: y1
        };

        var p2 = {
          x: x2,
          y: y2
        };
        disk.point(p1);
        disk.point(p2);

        disk.line(p1, p2, col1);
        disk.arc(p1, p2, col2);
      }

      //the canvas has been translated to the centre of the disk so need to
      //use an offset to clear it. NOT WORKING

    }, {
      key: 'clear',
      value: function clear() {
        elems.ctx.clearRect(-dims.windowWidth / 2, -dims.windowHeight / 2, dims.windowWidth, dims.windowHeight);
      }

      //draw a (euclidean) line between two points

    }, {
      key: 'drawEuclideanLine',
      value: function drawEuclideanLine(p1, p2, colour) {
        var c = colour || 'black';
        elems.ctx.beginPath();
        elems.ctx.moveTo(p1.x, p1.y);
        elems.ctx.lineTo(p2.x, p2.y);
        elems.ctx.strokeStyle = c;
        elems.ctx.stroke();
      }
    }]);

    return Canvas;
  }();

  var canvas = new Canvas();
});

},{}]},{},[1]);
