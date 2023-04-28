import sanitize from 'sanitize-html'

// We want to allow images
const allowedTags = sanitize.defaults.allowedTags.concat(['img'])
const allowedAttributes = sanitize.defaults.allowedAttributes
// Allow class and style attribute for all tags
allowedTags.forEach(tag => {
    const allowed = allowedAttributes[tag] ?? []
    allowed.push('class', 'style')
    allowedAttributes[tag] = allowed
})

export default function sanitizeHtml(htmlString: string): string {
    return sanitize(htmlString, { allowedTags, allowedAttributes })
}
