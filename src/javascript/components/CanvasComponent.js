import _ from 'underscore';
import { TweenLite } from 'gsap/TweenMax';
import Lerp from '../utils/Lerp.js';
import FaceRecognitionModule from './FaceRecognitionModule.js';
import SoundComponent from './SoundComponent.js';
import dat from 'dat.gui';

//
class CanvasComponent {
  constructor() {
    _.bindAll(
      this,
      '_tickHandler',
      '_resizeHandler',
      '_mousemoveHandler',
      '_initConfettis'
    );

    this._canvas = document.querySelector('.js-canvas-component');
    this._canvas.style.background = 'black';
    this._ctx = this._canvas.getContext('2d');

    this.components = {
      faceDetection: new FaceRecognitionModule(),
      SoundComponent: new SoundComponent()
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
    gui.add(this._settings, 'shootInterval', 100, 1000).step(1);
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

  _initConfettis() {
    this._confettisColor = [
      'blue',
      'red',
      'green',
      'pink',
      'yellow',
      'purple',
      'orange'
    ];

    this._confettis = [];

    let conffeti = {
      position: this._mouseBoundingBoxes[0].center,
      opacity: 1,
      rotation: Math.random() * 100,
      content: this.note,
      color: this._confettisColor[
        Math.round(Math.random() * this._confettisColor.length - 1)
      ]
    };
    this._confettis.push(conffeti);

    this._addConfettis();
  }

  _addConfettis() {
    setInterval(() => {
      if (!this._mouseBoundingBoxes[0]) return;

      let conffeti = {
        position: this._mouseBoundingBoxes[0].center,
        opacity: 1,
        rotation: Math.random() * 100,
        content: this.note,
        color: this._confettisColor[
          Math.round(Math.random() * this._confettisColor.length - 1)
        ]
      };
      this._confettis.push(conffeti);
    }, this._settings.shootInterval);
  }

  _updateConfettis() {
    if (!this._confettis) return;
    if (!this._mouseBoundingBoxes[0]) return;

    for (let i = 0; i < this._confettis.length; i++) {
      this._confettis[i].position.y -= this._settings.speed;
      this._confettis[i].rotation += this._settings.speed * 0.01;
      this._confettis[i].opacity -= this._settings.speed * 0.001;

      // if (this._confettis[i].position.y <= 0) {
      //   this._confettis[i].position = this._mouseBoundingBoxes[0].center;
      //   this._confettis[i].opacity = 1;
      // }
    }
  }

  _drawConfettis() {
    if (!this._confettis) return;
    //STYLES
    this._ctx.font = `${this._settings.fontSize}px arial`;

    for (let i = 0; i < this._confettis.length; i++) {
      this._ctx.beginPath();
      this._ctx.fillStyle = this._confettis[i].color;
      this._ctx.globalAlpha = this._confettis[i].opacity;
      this._ctx.fillText(
        this._confettis[i].content,
        this._confettis[i].position.x,
        this._confettis[i].position.y
      );
      this._ctx.closePath();
    }
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

  _drawNote() {
    if (!this._mouseBoundingBoxes) return;

    let content = this.note;
    if (this.note == undefined) {
      content = 'SING';
    }

    this._ctx.fillStyle = 'white';
    this._ctx.font = '100px Arial';

    this._ctx.setTransform(1, 0, 0, 1, 0, 0);
    this._ctx.fillText(content, this._width / 2, this._height / 2);
  }

  _mouseDetectedHandler() {
    if (this._isMouseDetected) return;
    if (!this._faceDescriptions) return;

    this._isMouseDetected = true;
    this._initConfettis();
  }

  _mouseOpenHandler() {
    if (!this._mouseBoundingBoxes) return;

    for (let n = 0; n < this._mouseBoundingBoxes.length; n++) {
      let mouseOpenSize =
        this._mouseBoundingBoxes[n].bottom - this._mouseBoundingBoxes[n].top;
      if (mouseOpenSize > 5) {
        console.log(n);
      }
    }
  }

  _getNote() {
    if (!this.components.SoundComponent.getCurrentNote()) return;

    this.note = this.components.SoundComponent.getCurrentNote();
  }

  _draw() {
    this._ctx.clearRect(0, 0, this._width, this._height);

    this._faceDescriptions = this.components.faceDetection.getFaceDescription(
      this._width,
      this._height
    );

    this._getMouseBoudingBoxes();
    this._getNote();

    this._drawMouses();
    // this._drawNote();

    this._updateConfettis();
    this._drawConfettis();

    this._mouseDetectedHandler();
    this._mouseOpenHandler();

    this._ctx.globalAlpha = 1;
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
