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
