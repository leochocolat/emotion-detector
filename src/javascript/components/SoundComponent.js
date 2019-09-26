import _ from 'underscore';

import autoCorrelate from '../modules/autoCorrelate';
import Note from '../utils/Note';

class SoundComponent {
  constructor() {
    _.bindAll(this, '_getPitch');

    this._setup();
  }

  _setup() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this._audioContext = new AudioContext();

    this._setupMicrophone();
  }

  _setupMicrophone() {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(stream => {
        document.querySelector('.js-indication').innerHTML = '';
        this._microphone = this._audioContext.createMediaStreamSource(stream);

        this._setupAnalyser();
        // this._microphone.connect(this._audioContext.destination);
      });
  }

  _setupAnalyser() {
    this._analyser = this._audioContext.createAnalyser();
    this._analyser.fftSize = 2048;
    this._microphone.connect(this._analyser);

    this._getPitch();
    this._createNote(this._note);
  }

  _getPitch() {
    let frequency = new Float32Array(this._analyser.frequencyBinCount);
    let sampleRate = this._audioContext.sampleRate;

    this._analyser.getFloatTimeDomainData(frequency);

    let autoCorrelation = autoCorrelate(frequency, sampleRate);
    this._note = Note.getNoteFromPitch(autoCorrelation).note;

    requestAnimationFrame(this._getPitch);
  }

  _createNote(note) {
    if (this._note === undefined) return;
    let harmonies = Note.getHarmoniesFromNote();

    // this._oscillator.connect(this._audioContext.destination);
  }

  getCurrentNote() {
    if (!this._note) return;

    return this._note;
  }
}

export default SoundComponent;
