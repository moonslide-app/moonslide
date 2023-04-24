/*
 *  Reveal.js initialization
 *  ========================
 */

RevealEditor.initialize({
    controls: true,
    progress: true,
    history: true,
    center: true,
    slideNumber: true,
    transition: 'slide', // none/fade/slide/convex/concave/zoom

    plugins: [RevealHighlight, RevealNotes, RevealMenu],

    menu: {
        openButton: false,
        numbers: true,
        themes: [
            { name: 'Black', theme: './theme/black.css' },
            { name: 'White', theme: './theme/white.css' },
        ],
    },
})

RevealEditor.configure({
    //showNotes: 'separate-page',
    pdfSeparateFragments: false,
})
