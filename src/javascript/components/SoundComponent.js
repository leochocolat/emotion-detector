import _ from 'underscore';
import Tone from 'tone';

var synth = new Tone.PolySynth().toMaster();

import autoCorrelate from '../modules/autoCorrelate';
import Note from '../utils/Note';

class SoundComponent {
  static get DECAY() {
    return 500;
  }

  constructor() {
    _.bindAll(this, '_getPitch');
    this._last = 0;
    this._setup();
  }

  get note() {
    return this._note;
  }

  set note(value) {
    if (value == this._note && value !== undefined) {
      this.playCurrentNote();
    }
    this._note = value;
  }

  playCurrentNote() {
    if (Date.now() - this._last > SoundComponent.DECAY) {
      synth.triggerAttackRelease(this._note + '3', '4n');
      this._last = Date.now();
    }
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
    this.note = Note.getNoteFromPitch(autoCorrelation).note;

    requestAnimationFrame(this._getPitch);
  }

  _createNote(note) {
    if (this._note === undefined) return;
    let harmonies = Note.getHarmoniesFromNote();

    //create a synth and connect it to the master output (your speakers)

    //play a middle 'C' for the duration of an 8th note
    synth.triggerAttackRelease(this._note + '3', '4n');
    console.log(this._note + '3');
    // this._oscillator.connect(this._audioContext.destination);
  }

  getCurrentNote() {
    if (!this._note) return;

    return this._note;
  }
}

export default SoundComponent;
