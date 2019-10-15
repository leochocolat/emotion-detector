import _ from 'underscore';
import { TweenLite } from 'gsap/TweenMax';
import Lerp from '../utils/Lerp.js';
import FaceRecognitionModule from './FaceRecognitionModule.js';
import dat from 'dat.gui';

//
class CanvasComponent {
  constructor() {
    _.bindAll(
      this,
      '_tickHandler',
      '_resizeHandler',
      '_mousemoveHandler'
    );

    this.ui = {
      video: document.querySelector('video')
    };

    this._canvas = document.querySelector('.js-canvas-component');
    this._canvas.style.background = 'black';
    this._ctx = this._canvas.getContext('2d');

    this.components = {
      faceDetection: new FaceRecognitionModule(),
    };

    this._settings = {
      limit: 200,
      speed: 10,
      shootInterval: 200,
      fontSize: 20
    };

    const gui = new dat.GUI();
    gui
      .add(this._settings, 'limit', 100, 1000)
      .step(1)
      .onChange(this._initConfettis);
    gui.add(this._settings, 'speed', 1, 100).step(1);
    gui.add(this._settings, 'shootInterval', 10, 1000).step(1);
    gui.add(this._settings, 'fontSize', 1, 500).step(1);

    this._isMouseDetected = false;
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

    const radius = 1.5;
    
    this._mouseBoundingBoxes = [];
    
    for (let n = 0; n < this._faceDescriptions.length; n++) {
      let responsePositions = this._faceDescriptions[n].landmarks.positions;

      for (let i = 0; i < responsePositions.length; i++) {
        this._ctx.beginPath();
        if (i == 0) {
          this._ctx.moveTo(responsePositions[i].newX, responsePositions[i].y);
        } else {
          this._ctx.lineTo(responsePositions[i].newX, responsePositions[i].y);
        }
        this._ctx.closePath();
        this._ctx.stroke();

        this._ctx.beginPath();
        this._ctx.fillStyle = '#04F802';
        this._ctx.arc(responsePositions[i].newX, responsePositions[i].y, radius, 0, 2 * Math.PI);
        this._ctx.closePath();
        this._ctx.fill();
      }

      //left: 48, right: 54, Top: 57, bottom: 50
      let center = {
        x:
          (responsePositions[54].newX - responsePositions[48].newX) / 2 +
          responsePositions[48].newX,
        y:
          (responsePositions[57].y - responsePositions[50].y) / 2 +
          responsePositions[50].y
      };
      let top = {
        x: responsePositions[57].newX,
        y: responsePositions[57].y
      };
      let right = {
        x: responsePositions[54].newX,
        y: responsePositions[54].y
      };
      let bottom = {
        x: responsePositions[50].newX,
        y: responsePositions[50].y
      };
      let left = {
        x: responsePositions[48].newX,
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
  
  _drawBackground() {
    this._ctx.beginPath();
    this._ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.width);
    this._ctx.closePath();
  }

  _drawVideo() {
    this._ctx.save();
    this._ctx.setTransform(-1, 0, 0, 1, 0, 0);
    this._ctx.globalAlpha = 0.8;
    this._ctx.drawImage(this.ui.video, -this._width, 0);
    this._ctx.setTransform(1, 0, 0, 1, 0, 0);
    this._ctx.restore();
  }

  _draw() {
    this._drawBackground();

    let detection = this.components.faceDetection.getFaceDescription(
      this._width,
      this._height
    );
    this._faceDescriptions = this._reverseDetectionX(detection);

    // this._drawVideo();

    this._getMouseBoudingBoxes();

    this._ctx.globalAlpha = 1;
  }

  _reverseDetectionX(detection) {
    if (!detection) return;

    for (let n = 0; n < detection.length; n++) {
      for (let i = 0; i < detection[n].landmarks.positions.length; i++) {
        let newPositionX =
          this._width / 2 +
          (this._width / 2 - detection[n].landmarks.positions[i].x);
        detection[n].landmarks.positions[i].newX = newPositionX;
      }
    }

    return detection;
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

export default CanvasComponent;
