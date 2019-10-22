import { TweenLite, Power2 } from 'gsap';
 
class LoaderComponent {
    constructor() {
        this.el = document.querySelector('.js-section-loading');

        this.ui = {
            items: document.querySelectorAll('.js-loading__item'),
            video: document.querySelectorAll('.video')
        }
    }

    close() {
        // TweenLite.to(this.ui.items, 1, { autoAlpha: 0, y: -50, ease: Power2.easeInOut });
        // TweenLite.to(this.el, .5, { autoAlpha: 0, ease: Power2.easeInOut }, 1);
        TweenLite.set(this.ui.items, { autoAlpha: 0 });
        TweenLite.set(this.el, { autoAlpha: 0 });
        TweenLite.set(this.ui.video, { display: 'block' });
        document.body.style.overflow = 'visible';
    }

}

export default LoaderComponent;