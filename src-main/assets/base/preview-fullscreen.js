var MOONSLIDE_ENV = 'preview-fullscreen'

const overrideConfig = { hash: true }

function enforceConfigOptions() {
    const revealInitialize = Reveal.initialize
    const revealConfigure = Reveal.configure
    const alreadyInitialized = Reveal.isReady()
    Object.assign(Reveal, {
        initialize(config, ...args) {
            console.debug(`Moonslide trapped the call to 'Reveal.initialize' and enforced some options.`)
            return revealInitialize({ ...config, ...overrideConfig }, ...args).then(() => {
                if (!alreadyInitialized) enforceConfigOptions()
            })
        },
        configure(config, ...args) {
            return revealConfigure({ ...config, ...overrideConfig }, ...args)
        },
    })
}

enforceConfigOptions()

window.addEventListener('message', event => {
    if (event.data.name === 'moonslide:update') {
        updatePreview(event.data.newSlides)
    } else if (event.data.name === 'moonslide:reload') {
        window.location.reload()
    } else if (event.data.name === 'moonslide:show-slide') {
        Reveal.slide(event.data.slideNumber)
    }
})

function updatePreview(newSlides) {
    const savedState = Reveal.getState()
    const slidesContainer = document.querySelector('.reveal>.slides')
    const parsedNewSlides = createSlideContents(newSlides ?? '')
    removeAllChildren(slidesContainer)
    slidesContainer.appendChild(parsedNewSlides)
    // prevent flickering for fragments on setState
    performWithDisabledLayout(() => Reveal.setState(savedState))
    runAllPlugins()
    Reveal.configure({})
    Reveal.setState(savedState)
}

function runAllPlugins() {
    Object.values(Reveal.getPlugins()).forEach(plugin => plugin.init(Reveal))
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
