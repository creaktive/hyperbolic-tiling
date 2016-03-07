import * as E from './euclid';
import {
  RegularTesselation
}
from './regularTesselation';

// * ***********************************************************************
// *
// *   POLYFILLS
// *
// *************************************************************************

Math.sinh = Math.sinh || function(x) {
  var y = Math.exp(x);
  return (y - 1 / y) / 2;
}

Math.cosh = Math.cosh || function(x) {
  var y = Math.exp(x);
  return (y + 1 / y) / 2;
};

Math.cot = Math.cot || function(x) {
  return 1 / Math.tan(x);
};

// * ***********************************************************************
// *
// *   SETUP
// *
// *************************************************************************

//Global radius
window.radius = (window.innerWidth < window.innerHeight) ? (window.innerWidth / 2) - 5 : (window.innerHeight / 2) - 5;

let tesselation;
let p = E.randomInt(3, 7);
let q = E.randomInt(3, 7);
let maxLayers;

if ((p-2)*(q-2) < 5){
  q = 5;
  p = 4
}

if(p * q < 22) maxLayers = 4;
else if(p * q < 29) maxLayers = 3;
else maxLayers = 2

//Run after load to get window width and height
window.onload = () => {
  tesselation = new RegularTesselation(6, 4, 2);
  //tesselation = new RegularTesselation(p, q, maxLayers);
}

window.onresize = () => {
  tesselation.disk.draw.resize();
}
