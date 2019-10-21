class LoaderComponent {
    constructor() {
        this.el = document.querySelector('.js-section-loading');
    }

    close() {
        document.body.style.overflow = 'visible';
        this.el.style.display = 'none';
    }

}

export default LoaderComponent;