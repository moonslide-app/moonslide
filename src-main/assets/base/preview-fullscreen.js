var RevealEditor = {
    ...Reveal,
    initialize(config, ...args) {
        const newConfig = {
            ...config,
            hash: true,
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
