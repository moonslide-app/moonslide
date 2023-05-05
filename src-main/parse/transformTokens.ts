import Token from 'markdown-it/lib/token'

export function transformTokens(initialTokens: Token[]): Token[] {
    let tokens = initialTokens
    tokens = tokens.filter((token, idx, array) => {
        const nextToken = array.at(idx + 1)
        const imageChild = nextToken?.children?.at(0)
        if (token.type === 'paragraph_open' && nextToken?.type === 'inline' && imageChild?.type === 'image') {
            imageChild.attrSet('style', joinStyles(token.attrGet('style'), imageChild.attrGet('style')))
            if (token.attrGet('class')) imageChild.attrJoin('class', token.attrGet('class') ?? '')
            return false
        }

        return true
    })

    tokens = tokens.filter((token, idx, array) => {
        const lastToken = array.at(idx - 1)
        if (
            token.type === 'paragraph_close' &&
            lastToken?.type === 'inline' &&
            lastToken?.children?.at(0)?.type === 'image'
        )
            return false
        return true
    })

    tokens = replaceBgImages(tokens)

    return tokens
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
