RevealEditor.initialize({
    controls: true,
    progress: true,
    history: true,
    slideNumber: true,
    transition: 'slide',
    backgroundTransition: 'slide',
    // Add desired plugins (the scripts must be included in config.yml)
    plugins: [RevealHighlight, RevealMath, RevealZoom, RevealSearch],
    // Be careful changing these two properties. Changing them can lead to
    // unexpected behaviour with the layouts in the PDF-Export.
    center: false,
    margin: 0,
})
