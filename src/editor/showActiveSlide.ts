import { RangeSetBuilder } from '@codemirror/state'
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view'
import { findCurrentSlide } from './codeMirrorHelpers'

export const showActiveSlide = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet

        constructor(view: EditorView) {
            this.decorations = activeSlideDecorator(view)
        }

        update(update: ViewUpdate) {
            this.decorations = activeSlideDecorator(update.view)
        }
    },
    {
        decorations: v => v.decorations,
    }
)

const activeDecoration = Decoration.line({
    attributes: { class: 'active-slide' },
})

function activeSlideDecorator(view: EditorView) {
    const builder = new RangeSetBuilder<Decoration>()
    const currentSlide = findCurrentSlide(view.state)

    if (!currentSlide) return builder.finish()

    for (const { from, to } of view.visibleRanges) {
        for (let pos = from; pos <= to; ) {
            const line = view.state.doc.lineAt(pos)
            if (line.to >= currentSlide.frontMatter.from - 1 && line.to <= currentSlide.markdown.to) {
                builder.add(line.from, line.from, activeDecoration)
            }
            pos = line.to + 1
        }
    }
    return builder.finish()
}
