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
  }

  _loadModels() {
    let promises = [
      FaceApi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      FaceApi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      FaceApi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      FaceApi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      FaceApi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      FaceApi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      FaceApi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      FaceApi.nets.mtcnn.loadFromUri(MODEL_URL)
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
      .withFaceExpressions()
      .withAgeAndGender()
      .then(response => {
        this._fullFaceDescriptions = response;
        console.log(response);
        this._draw();
        this._displayEmotions();
      });

    requestAnimationFrame(this._detectFace.bind(this));
  }

  _displayEmotions() {
    if (!this._fullFaceDescriptions) return;
    if (!this._fullFaceDescriptions[0].expressions) return;

    document.querySelector('.js-emotion-neutral').innerHTML = Math.round(this._fullFaceDescriptions[0].expressions.neutral);
    document.querySelector('.js-emotion-disgusted').innerHTML = Math.round(this._fullFaceDescriptions[0].expressions.disgusted);
    document.querySelector('.js-emotion-fearful').innerHTML = Math.round(this._fullFaceDescriptions[0].expressions.fearful);
    document.querySelector('.js-emotion-happy').innerHTML = Math.round(this._fullFaceDescriptions[0].expressions.happy);
    document.querySelector('.js-emotion-sad').innerHTML = Math.round(this._fullFaceDescriptions[0].expressions.sad);
    document.querySelector('.js-emotion-surprised').innerHTML = Math.round(this._fullFaceDescriptions[0].expressions.surprised);
    document.querySelector('.js-emotion-angry').innerHTML = Math.round(this._fullFaceDescriptions[0].expressions.angry);
  }

  _draw() {
    this._canvas = document.querySelector('.js-canvas-component');

    let displaySize = {
      width: this._canvas.width,
      height: this._canvas.height
    };

    const resizeDetection = FaceApi.resizeResults(
      this._fullFaceDescriptions,
      displaySize
    );

    this._canvas
      .getContext('2d')
      .clearRect(0, 0, displaySize.width, displaySize.height);

    FaceApi.draw.drawDetections(this._canvas, resizeDetection);
    FaceApi.draw.drawFaceLandmarks(this._canvas, resizeDetection);
  }

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
