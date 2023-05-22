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
    if (event.data.name === 'reveal-editor:update') {
        updatePreview(event.data.newSlides)
    } else if (event.data.name === 'reveal-editor:reload') {
        window.location.reload()
    }
})

function updatePreview(newSlides) {
    const savedState = Reveal.getState()
    const slidesContainer = document.getElementById('slides')
    const parsedNewSlides = createSlideContents(newSlides ?? '')
    removeAllChildren(slidesContainer)
    slidesContainer.appendChild(parsedNewSlides)
    // prevent flickering for fragments on setState
    performWithDisabledLayout(() => Reveal.setState(savedState))
    Reveal.setState(savedState)
}

function performWithDisabledLayout(action) {
    const config = Reveal.getConfig()
    const actualDisableLayout = config.disableLayout
    config.disableLayout = true

    action()

    config.disableLayout = actualDisableLayout
}

function createSlideContents(htmlString) {
    const template = document.createElement('template')
    template.innerHTML = htmlString

    return template.content
}

function removeAllChildren(htmlElement) {
    while (htmlElement.firstChild) htmlElement.firstChild?.remove()
}
