import _ from 'underscore';

import LoaderComponent from './LoaderComponent';
import DataManager from './DataManager';
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
    _.bindAll(this, '_buttonClickHandler', '_submitHandler', '_videoEndedHandler');

    this._isApiReady = false;
    this._loadingComponent = new LoaderComponent();
    this._dataManager = new DataManager();
    this._loadModels();

    this.ui = {
      videos: document.querySelectorAll('.js-video'),
      buttons: document.querySelectorAll('.js-button__video'),
      submit: document.querySelector('.submit')
    }
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
    FaceApi.detectSingleFace(this._video, new FaceApi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender()
      .then(response => {
        this._fullFaceDescriptions = response;
        this._getData();

        if(this._isApiReady) return;
        this._start();
        this._isApiReady = true;
      });

    requestAnimationFrame(this._detectFace.bind(this));
  }

  getFaceDescription(width, height) {
    if (!this._fullFaceDescriptions) return;

    this._resizedFaceDescriptions = FaceApi.resizeResults(
      this._fullFaceDescriptions,
      { width, height }
    );

    return this._resizedFaceDescriptions;
  }

  _getData() {
    if (!this._isRecording) return;

    this._dataManager.pushData(this._currentVideoTarget, this._fullFaceDescriptions);
  }

  _start() {
    this._loadingComponent.close();
    this._setupEventListeners();
  }

  _setupEventListeners() {
    for (let i = 0; i < this.ui.buttons.length; i++) {
      this.ui.buttons[i].addEventListener('click', this._buttonClickHandler)
    }
    this.ui.submit.addEventListener('click', this._submitHandler)
  }

  _buttonClickHandler(e) {
    if (this._isRecording) return;

    this._isRecording = true;
    e.target.style.display = 'none';
    this._currentVideoTarget = e.target.parentNode.querySelector('.js-video');
    this._currentVideoTarget.play();
    this._currentVideoTarget.addEventListener('ended', this._videoEndedHandler)
  }

  _videoEndedHandler() {
    this._isRecording = false;
  }

  _submitHandler() {
    this._dataManager.sendData();
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

  //   let ctx = this._canvas.getContext('2d');
  //   ctx.fillStyle = 'black';
  //   ctx.fillRect(0, 0, displaySize.width, displaySize.height);

  //   FaceApi.draw.drawDetections(this._canvas, resizeDetection);
  //   FaceApi.draw.drawFaceLandmarks(this._canvas, resizeDetection);
  // }
}

export default FaceRecognitionModule;
