import { Extension } from '@codemirror/state'
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

            const content = view.contentDOM
            const contentRect = content.getBoundingClientRect()

            const contentStyle = getComputedStyle(content)
            const topOffset = content.offsetTop + parseFloat(contentStyle.paddingTop)

            const startBlock = view.lineBlockAt(currentSlide.fullSlide.from)
            const endBlock = view.lineBlockAt(Math.min(doc.length, currentSlide.fullSlide.to))

            return [
                new RectangleMarker(
                    'active-slide',
                    contentRect.left,
                    topOffset + startBlock.top,
                    contentRect.right - contentRect.left,
                    endBlock.bottom - startBlock.top
                ),
            ]
        },
    })
}
