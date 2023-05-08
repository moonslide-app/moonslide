import Token from 'markdown-it/lib/token'

export function transformTokens(initialTokens: Token[]): Token[] {
    console.log('TRANSFORM START')
    initialTokens.forEach(token => console.log(token))
    console.log('TRANSFORM END')

    let tokens = initialTokens

    // Remove paragraphs, which only contain an image
    // Move images to top-level
    tokens = tokens.filter((token, idx, array) => {
        const nextToken = array.at(idx + 1)
        const nextTokenChildren = nextToken?.children ?? []
        const imageChild = nextTokenChildren.at(0)

        if (token.type === 'paragraph_open' && isBlockImage(nextToken) && imageChild) {
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

    return tokens
}

function isBlockImage(token: Token | undefined): boolean {
    const children = token?.children?.filter(token => !!token.content.trim()) ?? []
    const imageChild = children.at(0)
    return token?.type === 'inline' && children.length == 1 && imageChild?.type === 'image'
}

function replaceBgImages(tokens: Token[]): Token[] {
    return tokens.flatMap(token => {
        if (token.children) token.children = replaceBgImages(token.children)
        if (token.type !== 'image') return [token]
        if (!token.attrs) token.attrs = []

        token.tag = 'div'
        token.nesting = 1

        const src = token.attrGet('src') ?? ''
        token.attrs.splice(token.attrIndex('src'), 1)

        const style = joinStyles(token.attrGet('style'), `background-image: url(${src});`)
        token.attrSet('style', style)

        token.attrJoin('class', 'image')

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
