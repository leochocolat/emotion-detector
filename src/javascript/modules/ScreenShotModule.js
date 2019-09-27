import _ from 'underscore';

class ScreenShotModule {
  constructor() {
    _.bindAll(this, '_buttonClickHandler');

    this.ui = {
      button: document.querySelector('.button__screenshot'),
      canvas: document.querySelector('.js-canvas-component')
    };
    this._setupEventListener();
  }

  _screenshot() {
    let ctx = this.ui.canvas.getContext('2d');
    let imageData = ctx.getImageData(
      this.ui.canvas.getBoundingClientRect().x,
      this.ui.canvas.getBoundingClientRect().y,
      this.ui.canvas.clientWidth,
      this.ui.canvas.height
    );

    ctx.putImageData(
      imageData,
      this.ui.canvas.getBoundingClientRect().x,
      this.ui.canvas.getBoundingClientRect().y
    );

    let dataUrl = this.ui.canvas.toDataURL('image/png');

    let href = document.createElement('a');
    href.innerHTML = 'Download image';
    href.href = dataUrl;
    href.download = 'MyExperience.png';

    document.body.appendChild(href);
  }

  _setupEventListener() {
    this.ui.button.addEventListener('click', this._buttonClickHandler);
  }

  _buttonClickHandler() {
    this._screenshot();
  }
}

export default new ScreenShotModule();
