var RevealEditor = {
    ...Reveal,
    initialize(config, ...args) {
        const newConfig = {
            ...config,
            plugins: [],
            hash: true,
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
        }
        Reveal.initialize(newConfig, ...args)
    },
}
