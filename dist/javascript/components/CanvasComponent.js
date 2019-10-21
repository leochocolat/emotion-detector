import _ from 'underscore';
import { TweenLite } from 'gsap/TweenMax';
import Lerp from '../utils/Lerp';
import FaceRecognitionModule from './FaceRecognitionModule';
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
      clearOpacity: 1,
      drawNumbers: false
    };

    const gui = new dat.GUI();
    gui.add(this._settings, 'clearOpacity', 0, 1).step(0.01);
    gui.add(this._settings, 'drawNumbers');

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

    this._aspectRatio = this._width / this._height;
    this._videoAspectRatio = 640/480;

    this._canvas.width = this._width;
    this._canvas.height = this._height;
  }

  _drawLandmarks() {
    if (!this._faceDescriptions) return;
    
    for (let n = 0; n < this._faceDescriptions.length; n++) {
      let responsePositions = this._faceDescriptions[n].landmarks.positions;

      for (let i = 0; i < responsePositions.length; i++) {
        this._ctx.beginPath();
        this._ctx.fillStyle = 'red';
        this._ctx.arc(responsePositions[i].newX, responsePositions[i].y, 3, 0, Math.PI * 2);
        this._ctx.fill();
        this._ctx.closePath();
      }
      console.log(responsePositions);
    }
  }
  
  _drawBackground() {
    this._ctx.beginPath();
    this._ctx.fillStyle = `rgba(0, 0, 0, ${this._settings.clearOpacity})`;
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
    // this._drawBackground();

    let detection = this.components.faceDetection.getFaceDescription(
      this._width,
      this._height
    );
    this._faceDescriptions = this._reverseDetectionX(detection);

    // this._drawVideo();
    // this._drawLandmarks();

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
