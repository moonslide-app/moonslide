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

            const from = currentSlide.fullSlide.from
            const to = Math.min(doc.length, currentSlide.fullSlide.to)

            const startsAtFirstLine = doc.lineAt(from).number === 1
            const endsAtLastLine = doc.lineAt(to).number === doc.lines

            const content = view.contentDOM
            const contentRect = content.getBoundingClientRect()
            const contentStyle = getComputedStyle(content)
            const topPadding = parseFloat(contentStyle.paddingTop)
            const bottomPadding = parseFloat(contentStyle.paddingBottom)
            const topOffset = content.offsetTop + topPadding

            const startBlock = view.lineBlockAt(from)
            const endBlock = view.lineBlockAt(to)

            const leftPosition = contentRect.left
            const width = contentRect.right - contentRect.left

            let topPosition = topOffset + startBlock.top
            let height = endBlock.bottom - startBlock.top

            if (startsAtFirstLine) {
                topPosition -= topPadding
                height += topPadding
            }

            if (endsAtLastLine) {
                height += bottomPadding
            }

            return [new RectangleMarker('active-slide', leftPosition, topPosition, width, height)]
        },
    })
}
