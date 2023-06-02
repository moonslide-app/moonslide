import { EditorSelection, Extension } from '@codemirror/state'
import { RectangleMarker, layer } from '@codemirror/view'
import { findCurrentSlide } from './codeMirrorHelpers'

export function showActiveSlide(): Extension {
    return layer({
        above: false,
        class: 'active-slide-layer',
        update(update) {
            return update.docChanged || update.focusChanged || update.selectionSet
        },
        markers(view) {
            const currentSlide = findCurrentSlide(view.state)
            if (!currentSlide) return []

            const { doc } = view.state
            const range = EditorSelection.range(
                currentSlide.fullSlide.from,
                Math.min(doc.length, currentSlide.fullSlide.to + 1)
            )

            return RectangleMarker.forRange(view, 'active-slide', range)
        },
    })
}
