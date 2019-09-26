import _ from 'underscore';
import { TweenLite } from 'gsap/TweenMax';
import Lerp from '../utils/Lerp.js';
import FaceRecognitionModule from './FaceRecognitionModule.js';
import SoundComponent from './SoundComponent.js';

//
class CanvasComponent {
  constructor() {
    _.bindAll(this, '_tickHandler', '_resizeHandler', '_mousemoveHandler');

    this._canvas = document.querySelector('.js-canvas-component');
    this._ctx = this._canvas.getContext('2d');

    this.components = {
      faceDetection: new FaceRecognitionModule(),
      SoundComponent: new SoundComponent()
    };

    this._mouseOpen = false;

    this._setup();
  }

  _setup() {
    this._resize();

    this._setupEventListener();
  }

  _resize() {
    this._width = 640;
    this._height = 480;
    // this._width = window.innerWidth;
    // this._height = window.innerHeight;

    this._canvas.width = this._width;
    this._canvas.height = this._height;
  }

  _getMouseBoudingBoxes() {
    if (!this._faceDescriptions) return;

    this._mouseBoundingBoxes = [];

    for (let n = 0; n < this._faceDescriptions.length; n++) {
      let responsePositions = this._faceDescriptions[n].landmarks.positions;

      //left: 48, right: 54, Top: 57, bottom: 50
      let center = {
        x:
          (responsePositions[54].x - responsePositions[48].x) / 2 +
          responsePositions[48].x,
        y:
          (responsePositions[57].y - responsePositions[50].y) / 2 +
          responsePositions[50].y
      };
      let top = {
        x: responsePositions[57].x,
        y: responsePositions[57].y
      };
      let right = {
        x: responsePositions[54].x,
        y: responsePositions[54].y
      };
      let bottom = {
        x: responsePositions[50].x,
        y: responsePositions[50].y
      };
      let left = {
        x: responsePositions[48].x,
        y: responsePositions[48].y
      };

      this._mouseBoundingBoxes.push({ center, top, right, bottom, left });

      this._ctx.beginPath();
      this._ctx.fillStyle = 'red';
      this._ctx.arc(center.x, center.y, 5, 0, 2 * Math.PI);
      this._ctx.fill();
      this._ctx.closePath();
    }
  }

  _drawMouses() {
    if (!this._faceDescriptions) return;

    let radius = 2;
    this._ctx.fillStyle = 'white';
    this._ctx.font = '10px Arial';

    for (let n = 0; n < this._faceDescriptions.length; n++) {
      let positions = this._faceDescriptions[n].landmarks.positions;
      for (let i = 48; i < 60; i++) {
        // this._ctx.fillText(`${i}`, positions[i].x, positions[i].y);

        this._ctx.beginPath();
        this._ctx.arc(positions[i].x, positions[i].y, radius, 0, 2 * Math.PI);
        this._ctx.closePath();

        this._ctx.beginPath();
        this._ctx.arc(positions[i].x, positions[i].y, radius, 0, 2 * Math.PI);
        this._ctx.closePath();

        this._ctx.fill();
      }
    }
  }

  _MouseOpenHandler() {
    if (!this._mouseBoundingBoxes) return;

    for (let n = 0; n < this._mouseBoundingBoxes.length; n++) {
      if (
        this._mouseBoundingBoxes[n].bottom - this._mouseBoundingBoxes[n].top >
        5
      ) {
        console.log(n);
      }
    }
  }

  _draw() {
    this._ctx.clearRect(0, 0, this._width, this._height);

    this._faceDescriptions = this.components.faceDetection.getFaceDescription(
      this._width,
      this._height
    );

    this._getMouseBoudingBoxes();
    this._drawMouses();
    this._MouseOpenHandler();
  }

  _setupEventListener() {
    TweenLite.ticker.addEventListener('tick', this._tickHandler);
    window.addEventListener('resize', this._resizeHandler);
    window.addEventListener('mousemove', this._mousemoveHandler);
  }

  _tickHandler() {
    this._draw();
  }

  _resizeHandler() {
    this._resize();
  }

  _mousemoveHandler(e) {
    this._mousePosition = {
      x: e.clientX,
      y: e.clientY
    };
  }
}

export default new CanvasComponent();
