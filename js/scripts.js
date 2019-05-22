////////////////...Menu-hover...../////////////////////////////////////////////////////////////////
const triggers = document.querySelectorAll('.nav-link');
const highlight = document.createElement('span');
highlight.classList.add('highlight');
document.body.append(highlight);
function highlightLink() {
    const linkCoords = this.getBoundingClientRect();
    console.log(linkCoords);

    const coords = {
        width: linkCoords.width,
        height: linkCoords.height,
        top: linkCoords.top + window.scrollY,
        left: linkCoords.left + window.scrollX
    };

    highlight.style.width = `${coords.width}px`;
    highlight.style.height = `${coords.height}px`;
    highlight.style.transform = `translate(${coords.left}px, ${coords.top}px)`;
}
triggers.forEach(a => a.addEventListener('mouseenter', highlightLink));
triggers.forEach(a => a.addEventListener('focus', highlightLink));
////////////////...Menu-hover-end...../////////////////////////////////////////////////////////////////

////////////////...Slider.....///////////////////////////////////////////////////////////////////////
{
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    class Slideshow {
        constructor(el) {
            this.DOM = {};
            this.DOM.el = el;
            this.settings = {
                animation: {
                    slides: {
                        duration: 400,
                        easing: 'easeOutQuad'
                    },
                    shape: {
                        duration: 300,
                        easing: {in: 'easeInOutBack', out: 'easeInQuart'},
                    }
                },
                frameFill: '#181817'
            }
            this.init();
        }
        init() {
            this.DOM.slides = Array.from(this.DOM.el.querySelectorAll('.slides > .slide'));
            this.slidesTotal = this.DOM.slides.length;
            this.DOM.nav = this.DOM.el.querySelector('.slidenav');
            this.DOM.nextCtrl = this.DOM.nav.querySelector('.slidenav__item--next');
            this.DOM.prevCtrl = this.DOM.nav.querySelector('.slidenav__item--prev');
            this.current = 0;
            this.createFrame();
            this.initEvents();
        }
        createFrame() {
            this.rect = this.DOM.el.getBoundingClientRect();
            this.frameSize = this.rect.width/25;
            this.paths = {
                initial: this.calculatePath('initial'),
                final: this.calculatePath('final')
            };
            this.DOM.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.DOM.svg.setAttribute('class', 'shape');
            this.DOM.svg.setAttribute('width','100%');
            this.DOM.svg.setAttribute('height','100%');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            this.DOM.svg.innerHTML = `<path fill="${this.settings.frameFill}" d="${this.paths.initial}"/>`;
            this.DOM.el.insertBefore(this.DOM.svg, this.DOM.nav);
            this.DOM.shape = this.DOM.svg.querySelector('path');
        }
        updateFrame() {
            this.paths.initial = this.calculatePath('initial');
            this.paths.final = this.calculatePath('final');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            this.DOM.shape.setAttribute('d', this.isAnimating ? this.paths.final : this.paths.initial);
        }
        calculatePath(path = 'initial') {
            return path === 'initial' ?
                `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M 0,0 ${this.rect.width},0 ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z` :
                `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.rect.height-this.frameSize} ${this.frameSize},${this.rect.height-this.frameSize} Z`;
        }
        initEvents() {
            this.DOM.nextCtrl.addEventListener('click', () => this.navigate('next'));
            this.DOM.prevCtrl.addEventListener('click', () => this.navigate('prev'));

            window.addEventListener('resize', debounce(() => {
                this.rect = this.DOM.el.getBoundingClientRect();
                this.updateFrame();
            }, 20));

            document.addEventListener('keydown', (ev) => {
                const keyCode = ev.keyCode || ev.which;
                if ( keyCode === 37 ) {
                    this.navigate('prev');
                }
                else if ( keyCode === 39 ) {
                    this.navigate('next');
                }
            });
        }
        navigate(dir = 'next') {
            if ( this.isAnimating ) return false;
            this.isAnimating = true;

            const animateShapeIn = anime({
                targets: this.DOM.shape,
                duration: this.settings.animation.shape.duration,
                easing: this.settings.animation.shape.easing.in,
                d: this.paths.final
            });

            const animateSlides = () => {
                return new Promise((resolve, reject) => {
                    const currentSlide = this.DOM.slides[this.current];
                    anime({
                        targets: currentSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        translateX: dir === 'next' ? -1*this.rect.width : this.rect.width,
                        complete: () => {
                            currentSlide.classList.remove('slide--current');
                            resolve();
                        }
                    });

                    this.current = dir === 'next' ?
                        this.current < this.slidesTotal-1 ? this.current + 1 : 0 :
                        this.current > 0 ? this.current - 1 : this.slidesTotal-1;

                    const newSlide = this.DOM.slides[this.current];
                    newSlide.classList.add('slide--current');
                    anime({
                        targets: newSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        translateX: [dir === 'next' ? this.rect.width : -1*this.rect.width,0]
                    });

                    const newSlideImg = newSlide.querySelector('.slide__img');
                    anime.remove(newSlideImg);
                    anime({
                        targets: newSlideImg,
                        duration: 3500,
                        specialEasing: {
                            width: "easeInOutBack",
                            height: "easeOutElastic"
                        },
                        translateX: [dir === 'next' ? 400 : -200, 0],
                        translateY: [dir === 'next' ? 100 : -100, 0]
                    });

                    anime({
                        targets: [newSlide.querySelector('.slide__title')],
                        duration: this.settings.animation.slides.duration*6,
                        specialEasing: {
                            width: "easeOutElastic",
                            height: "easeInOutBack"
                        },
                        delay: (t,i) => i*300+200,
                        translateX: [dir === 'next' ? 900 : -900, 0],
                        translateY: [dir === 'next' ? -100 : -100,0],
                        opacity: [0,1]
                    });
                    anime({
                        targets: [ newSlide.querySelector('.slide__desc')],
                        duration: this.settings.animation.slides.duration*9,
                        specialEasing: {
                            width: "easeInOutBack",
                            height: "easeOutElastic"
                        },
                        delay: (t,i) => i*300+300,
                        translateX: [dir === 'next' ? 900 : -300,0],
                        translateY: [dir === 'next' ? 100 : 100, 0],
                        opacity: [0,1]
                    });
                });
            };

            const animateShapeOut = () => {
                anime({
                    targets: this.DOM.shape,
                    duration: this.settings.animation.shape.duration*2,
                    delay: 350,
                    easing: "easeInOutBack",
                    d: this.paths.initial,
                    complete: () => this.isAnimating = false
                });
            }

            animateShapeIn.finished.then(animateSlides).then(animateShapeOut);
        }
    };

    new Slideshow(document.querySelector('.slideshow'));
    imagesLoaded('.slide__img', { background: true }, () => document.body.classList.remove('loading'));
}
////////////...Slider-end...../////////////////////////////////////////////////////////////////

////////////...WOW-effect...../////////////////////////////////////////////////////////////////
wow = new WOW(
    {
        boxClass:     'wow',
        animateClass: 'animated',
        offset:       50,
        mobile:       true,
        live:         true
    }
)
wow.init()
////////////....WOW-effect-end...../////////////////////////////////////////////////////////////////