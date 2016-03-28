/* controller.js */

import {
  EuclideanTesselation,
}
from './euclidean/euclideanTesselation';
import {
  RegularHyperbolicTesselation,
}
from './hyperbolic/regularHyperbolicTesselation';
import {
  Drawing,
}
from './drawing';
import {
  Layout,
}
from './layout';

// * ***********************************************************************
// *
// *  CONTROLLER CLASS
// *
// *************************************************************************
export class Controller {
  constructor() {
    this.layout = new Layout();
    this.draw = new Drawing();
    this.setupControls();
    this.layout = new Layout();
    this.updateLowQualityTiling();
    this.throttledUpdateLowQualityTiling = _.throttle(() => {
      this.updateLowQualityTiling();
    }, 100);
    this.selectedTilingType = null;
  }

  onResize() {
    this.layout.onResize();
    const sliderValue = document.querySelector('#tiling-radius').value;
    if (this.draw.radius > sliderValue) {
      this.draw.radius = sliderValue;
    }
  }

  setupControls() {
    this.saveImageButtons();
    this.radiusSlider();
    this.tesselationTypeSelectButtons();
    this.generateTilingButton();
    this.polygonSidesDropdown();
    this.polygonsPerVertexDropdown();
  }

  tesselationTypeSelectButtons() {
    const euclidean = document.querySelector('#euclidean');
    const hyperbolic = document.querySelector('#hyperbolic');
    euclidean.onclick = () => {
      this.selectedTilingType = 'euclidean';
      euclidean.classList.add('selected');
      hyperbolic.classList.remove('selected');
      this.layout.showElement('#euclidean-controls');
      this.layout.hideElement('#hyperbolic-controls');
      this.layout.showElement('#universal-controls');
      this.throttledUpdateLowQualityTiling();
    };
    hyperbolic.onclick = () => {
      this.selectedTilingType = 'hyperbolic';
      hyperbolic.classList.add('selected');
      euclidean.classList.remove('selected');
      this.layout.showElement('#hyperbolic-controls');
      this.layout.hideElement('#euclidean-controls');
      this.layout.showElement('#universal-controls');
      this.throttledUpdateLowQualityTiling();
    };
  }

  polygonSidesDropdown() {
    const p = document.querySelector('#p');
    p.onchange = () => {
      this.throttledUpdateLowQualityTiling();
    };
  }

  polygonsPerVertexDropdown() {
    document.querySelector('#q').onchange = () => {
      this.throttledUpdateLowQualityTiling();
    };
  }

  radiusSlider() {
    const test = () => { console.log('test');};
    const slider = document.querySelector('#tiling-radius');
    const selectedRadius = document.querySelector('#selected-radius');
    this.draw.radius = slider.value;
    slider.oninput = () => {
      selectedRadius.innerHTML = slider.value;
      this.draw.radius = slider.value;
      this.throttledUpdateLowQualityTiling();
    };
  }

  updateLowQualityTiling() {
    document.querySelector('#low-quality-image').classList.remove('hide');
    if (this.selectedTilingType === 'euclidean') {
      this.generateEuclideanTiling('#low-quality-image', true);
    }
    else if (this.selectedTilingType === 'hyperbolic') {
      this.generateRegularHyperbolicTiling('#low-quality-image', true);
    }
  }

  addTilingImageToDom(spec, tiling, elem) {
    const t0 = performance.now();
    this.draw.polygonArray(tiling, spec.textures, 0xffffff, false, elem);
    const t1 = performance.now();
    console.log(`DrawTiling took ${(t1 - t0)} milliseconds.`);
  }

  generateTilingButton() {
    document.querySelector('#low-quality-image').classList.add('hide');
    document.querySelector('#image-controls').classList.remove('hide');
    document.querySelector('#generate-tiling').onclick = () => {
      if (this.selectedTilingType === 'euclidean') {
        this.generateEuclideanTiling('#final-image', false);
      }
      else if (this.selectedTilingType === 'hyperbolic') {
        this.generateRegularHyperbolicTiling('#final-image', false);
      }
    };
  }

  generateEuclideanTiling(elem, designMode) {
    this.draw.reset();
    const spec = this.euclideanTilingSpec();
    const tesselation = new EuclideanTesselation(spec);
    const tiling = tesselation.generateTiling(designMode);
    this.addTilingImageToDom(spec, tiling, elem);
  }

  euclideanTilingSpec() {
    return {
      wireframe: false,
      p: 4,
      q: 4,
      textures: ['./images/textures/fish-black1.png', './images/textures/fish-white1-flipped.png'],
    };
  }

  generateRegularHyperbolicTiling(elem, designMode) {
    this.draw.reset();
    const spec = this.regularHyperbolicTilingSpec();
    const tesselation = new RegularHyperbolicTesselation(spec);
    const t0 = performance.now();
    const tiling = tesselation.generateTiling(designMode);
    const t1 = performance.now();
    console.log(`generateTiling took ${(t1 - t0)} milliseconds.`);
    this.addTilingImageToDom(spec, tiling, elem);
  }

  regularHyperbolicTilingSpec() {
    return {
      wireframe: false,
      p: document.querySelector('#p').value,
      q: document.querySelector('#q').value,
      textures: ['./images/textures/fish-black1.png', './images/textures/fish-white1-flipped.png'],
      edgeAdjacency: [ //array of length p
                      [1, //edge_0 orientation (-1 = reflection, 1 = rotation)
                        5, //edge_0 adjacency (range p - 1)
                      ],
                      [1, 4], //edge_1 orientation, adjacency
                      [1, 3], [1, 2], [1, 1], [1, 0]],
      minPolygonSize: 0.05,
    };
  }

  saveImageButtons() {
    document.querySelector('#save-image').onclick = () => this.draw.saveImage();
    document.querySelector('#download-image').onclick = () => this.draw.downloadImage();
  }
}
