class Note {
  constructor() {
    this._notes = [
      'C',
      'C#',
      'D',
      'D#',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'A',
      'A#',
      'B'
    ];
  }

  getNoteFromPitch(pitch) {
    let noteNum = 12 * (Math.log(pitch / 440) / Math.log(2));
    const A0 = 27.5;
    let octave = 0,
      octavePitch = 0;
    while (pitch > octavePitch) {
      octave++;
      octavePitch = A0 * Math.pow(2, octave);
    }

    Math.floor((Math.round(noteNum) + 69) / this._notes.length);
    let index = (Math.round(noteNum) + 69) % this._notes.length;

    // console.log({ note: this._notes[index], frequency: pitch, octave });

    return { note: this._notes[index], frequency: pitch, octave: octave };
  }

  getFrequencyFromNote(note, octave) {
    return 0;
  }

  getHarmoniesFromNote(note) {
    return [];
  }
}

export default new Note();
