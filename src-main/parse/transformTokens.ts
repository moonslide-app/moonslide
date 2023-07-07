import Token from 'markdown-it/lib/token'

export function transformTokens(initialTokens: Token[]): Token[] {
    let tokens = initialTokens

    // Move attributes of empty paragraph after code block
    // to code block
    tokens = tokens.filter((token, idx, array) => {
        if (token.meta === 'remove') return false

        const fence = array.at(idx - 1) // has to be fence
        const paragraphOpen = token // has to be paragraph_open
        const inline = array.at(idx + 1) // has to be inline with one child
        const inlineText = inline?.children?.at(0) // has to be empty text
        const paragraphClose = array.at(idx + 2) // has to be paragraph_close

        // if any condition is wrong, don't filter
        if (fence?.type !== 'fence') return true
        if (paragraphOpen.type !== 'paragraph_open') return true
        if (inline?.type !== 'inline') return true
        if (inlineText?.type !== 'text' || inlineText?.content !== '') return true
        if (paragraphClose?.type !== 'paragraph_close') return true

        // all conditions passed -> apply attrs to fence and filter out paragraph
        fence.attrs = paragraphOpen.attrs
        inline.meta = 'remove'
        paragraphClose.meta = 'remove'
        return false
    })

    // Remove paragraphs, which only contain an image
    // Move images to top-level
    tokens = tokens.filter((token, idx, array) => {
        const nextToken = array.at(idx + 1)
        const nextTokenChildren = nextToken?.children ?? []
        const imageChild = nextTokenChildren.at(0)

        if (token.type === 'paragraph_open' && isBlockImage(nextToken) && imageChild) {
            imageChild.meta = 'block'
            imageChild.attrSet('style', joinStyles(token.attrGet('style'), imageChild.attrGet('style')))
            if (token.attrGet('class')) imageChild.attrJoin('class', token.attrGet('class') ?? '')
            return false
        } else {
            return true
        }
    })

    tokens = tokens.filter((token, idx, array) => {
        const lastToken = array.at(idx - 1)
        if (token.type === 'paragraph_close' && isBlockImage(lastToken)) {
            return false
        } else {
            return true
        }
    })

    tokens = replaceBgImages(tokens)
    tokens = addBlankToLinks(tokens)

    return tokens
}

function addBlankToLinks(tokens: Token[]): Token[] {
    return tokens.map(token => {
        if (token.children) token.children = addBlankToLinks(token.children)
        if (token.type === 'link_open') {
            token.attrSet('target', '_blank')
        }
        return token
    })
}

function isBlockImage(token: Token | undefined): boolean {
    // ignore children which are empty (and not images)
    const children = token?.children?.filter(token => token.type === 'image' || token.content.trim()) ?? []
    const imageChild = children.at(0)
    return token?.type === 'inline' && children.length == 1 && imageChild?.type === 'image'
}

function replaceBgImages(tokens: Token[]): Token[] {
    return tokens.flatMap(token => {
        if (token.children) token.children = replaceBgImages(token.children)
        if (token.type !== 'image') return [token]
        if (!token.attrs) token.attrs = []

        if (token.meta !== 'block') {
            token.attrJoin('class', 'image image-inline')
            return [token]
        } else {
            token.attrJoin('class', 'image image-block')
        }

        token.tag = 'div'
        token.nesting = 1

        const src = token.attrGet('src') ?? ''
        token.attrs.splice(token.attrIndex('src'), 1)

        const style = joinStyles(token.attrGet('style'), `background-image: url('${src}');`)
        token.attrSet('style', style)

        const closingTag = new Token('image_closing_tag', 'div', -1)
        return [token, closingTag]
    })
}

function joinStyles(first: string | null | undefined, second: string | null | undefined): string {
    let style = first?.trim() ?? ''
    if (style && !style.endsWith(';')) style += ';'
    if (style) style += ' '

    style += second?.trim() ?? ''
    if (style && !style.endsWith(';')) style += ';'
    return style
}
