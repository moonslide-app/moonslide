var RevealEditor = {
    ...Reveal,
    initialize(config, ...args) {
        const newConfig = {
            ...config,
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
            autoPlayMedia: false,
        }
        Reveal.initialize(newConfig, ...args)
    },
}

window.addEventListener('message', event => {
    if (event.data.name === 'reveal-editor:update') {
        updatePreview(event.data.newSlides)
    }
})

function updatePreview(newSlides) {
    const slidesContainer = document.querySelector('.reveal>.slides')
    const parsedNewSlides = createSlideContents(newSlides ?? '')
    removeAllChildren(slidesContainer)
    slidesContainer.appendChild(parsedNewSlides)
    // prevent flickering for fragments on configure
    performWithDisabledLayout(() => Reveal.configure({}))
    runAllPlugins()
    Reveal.configure({})
}

function performWithDisabledLayout(action) {
    const config = Reveal.getConfig()
    const actualDisableLayout = config.disableLayout
    config.disableLayout = true

    action()

    config.disableLayout = actualDisableLayout
}

function runAllPlugins() {
    Object.values(Reveal.getPlugins()).forEach(plugin => plugin.init(Reveal))
}

function removeAllChildren(htmlElement) {
    while (htmlElement.firstChild) htmlElement.firstChild?.remove()
}

function createSlideContents(htmlString) {
    const template = document.createElement('template')
    template.innerHTML = htmlString

    return template.content
}
