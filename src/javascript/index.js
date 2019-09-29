import CanvasComponent from './components/CanvasComponent.js';
import SoundComponent from './components/SoundComponent.js';
import FaceRecognitionModule from './components/FaceRecognitionModule';
import ScreenShotModule from './modules/ScreenShotModule';

import { TweenLite } from 'gsap';
import TweenMax from 'gsap/TweenMax';

let INSTANCE = false;
let btn = document.querySelector('.js-indication__button');
let indication = document.querySelector('.js-indication');

btn.addEventListener('click', () => {
  if (INSTANCE) return;

  TweenMax.to(indication, 0.5, {
    autoAlpha: 0,
    ease: Power1.easeInOut,
    onComplete: () => {
      indication.innerHTML = 'Please active your Microphone and Camera';
      new CanvasComponent();
    }
  });

  TweenLite.to(btn, 0.5, {
    autoAlpha: 0,
    ease: Power1.easeInOut
  });

  TweenLite.to(indication, 0.5, {
    autoAlpha: 1,
    ease: Power1.easeInOut,
    delay: 1
  });

  INSTANCE = true;
});
