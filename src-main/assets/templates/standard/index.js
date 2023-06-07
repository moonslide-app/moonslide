Reveal.initialize({
    controls: true,
    progress: true,
    history: true,
    slideNumber: true,
    transition: 'slide',
    backgroundTransition: 'slide',
    touch: true,
    pdfSeparateFragments: false,
    width: 1280,
    height: 720,
    // Add desired plugins (the scripts must be included in config.yml)
    plugins: [RevealHighlight, RevealMath, RevealZoom, RevealSearch, RevealNotes],
    // Changing those properties is not compatible with the layout system used
    // in this template, thus it's not recommended to change them
    center: false,
    margin: 0,
})
