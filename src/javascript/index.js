import CanvasComponent from './components/CanvasComponent.js';
import SoundComponent from './components/SoundComponent.js';
import FaceRecognitionModule from './components/FaceRecognitionModule';
import ScreenShotModule from './modules/ScreenShotModule';

new CanvasComponent();
//Prevent Chrome Sound Issue
window.addEventListener('click', () => {
  //   document.querySelector('.js-indication').innerHTML = 'Active Your Microphone';
});
