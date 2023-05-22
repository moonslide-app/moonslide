var RevealEditor = {
    ...Reveal,
    initialize(config, ...args) {
        const newConfig = {
            ...config,
            plugins: [],
            hash: false,
            controls: false,
            progress: false,
            history: false,
            keyboard: false,
            overview: false,
            touch: false,
            shuffle: false,
            fragments: false,
            autoAnimate: false,
            autoSlide: false,
            transition: 'none',
            slideNumber: false,
        }
        Reveal.initialize(newConfig, ...args)
    },
}

window.addEventListener('message', event => {
    if (event.data === 'reveal:reload') {
        Reveal.sync()
        Reveal.layout()
    }
})
