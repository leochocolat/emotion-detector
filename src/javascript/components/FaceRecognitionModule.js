import * as FaceApi from 'face-api.js';

const MODEL_URL = './assets/models';

const mtcnnForwardParams = {
  maxNumScales: 10,
  scaleFactor: 0.709,
  scoreThresholds: [0.6, 0.7, 0.7],
  minFaceSize: 200
};

class FaceRecognitionModule {
  constructor() {
    this._loadModels();
    // this._draw();
  }

  _loadModels() {
    let promises = [
      FaceApi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      FaceApi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      FaceApi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      FaceApi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ];

    Promise.all(promises).then(() => {
      this._getCamera();
    });
  }

  _getCamera() {
    this._video = document.querySelector('.webcam-stream');
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => {
        this._video.srcObject = stream;
        this._detectFace();
      });
  }

  _detectFace() {
    FaceApi.detectAllFaces(this._video, new FaceApi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .then(response => {
        this._fullFaceDescriptions = response;
        // this._draw();
      });

    requestAnimationFrame(this._detectFace.bind(this));
  }

  // _draw() {
  //   this._canvas = document.querySelector('.js-canvas-component');

  //   let displaySize = {
  //     width: this._canvas.width,
  //     height: this._canvas.height
  //   };

  //   const resizeDetection = FaceApi.resizeResults(
  //     this._fullFaceDescriptions,
  //     displaySize
  //   );

  //   this._canvas
  //     .getContext('2d')
  //     .clearRect(0, 0, displaySize.width, displaySize.height);

  //   FaceApi.draw.drawDetections(this._canvas, resizeDetection);
  //   FaceApi.draw.drawFaceLandmarks(this._canvas, resizeDetection);
  // }

  getFaceDescription(width, height) {
    if (!this._fullFaceDescriptions) return;

    this._resizedFaceDescriptions = FaceApi.resizeResults(
      this._fullFaceDescriptions,
      { width, height }
    );

    return this._resizedFaceDescriptions;
  }
}

export default FaceRecognitionModule;
