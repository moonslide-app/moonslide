import { isNonNullable } from '../../src-shared/entities/utils'
import { TemplateConfig } from '../../src-shared/entities/TemplateConfig'
import {
    ToolbarEntry,
    ToolbarItem as ToolbarItemType,
    ToolbarLayoutEntry,
    ToolbarLayoutItem,
} from '../../src-shared/entities/Toolbar'
import {
    ToolbarItemsEmpty,
    ToolbarItemGroup,
    ToolbarItemsSearch,
    ToolbarItem,
    Toolbar,
    ToolbarItems,
    ToolbarItemsContent,
    ToolbarItemsButton,
    ToolbarItemsList,
    ToolbarButton,
    ToolbarItemSeparator,
    ToolbarItemValue,
    ToolbarShortcut,
} from './ui/toolbar'
import {
    blockBlockquote,
    blockH1,
    blockH2,
    blockH3,
    blockH4,
    blockOl,
    blockUl,
    formatCodeBlock,
    formatCodeInline,
    formatEmphasize,
    formatLink,
    formatMathBlock,
    formatMathInline,
    formatStrikethrough,
    formatStrong,
    selectMedia,
} from '../editor/modifiers'
import { HelpTooltip } from './HelpTooltip'
import { CodeMirrorEditorRef } from '../editor/CodeMirrorEditorRef'
import { useEventListener } from 'usehooks-ts'
import { Plus } from 'lucide-react'

function ItemsPresentation(props: { editorRef: CodeMirrorEditorRef }) {
    const items: ToolbarEntry[] = [
        {
            name: 'Presentation',
            items: [
                {
                    id: 'presentation:template',
                    name: 'Template',
                    key: 'template',
                    description:
                        'You can either use the default template `standard` or specify a path to your custom template folder. See [Create your own Template](https://github.com/moonslide-app/moonslide#create-your-own-template-).',
                },
                {
                    id: 'presentation:theme',
                    name: 'Theme',
                    key: 'theme',
                    description:
                        'The theme changes the appereance of your presentation. There are two themes on the standard template: `black` and `white`.',
                },
                {
                    id: 'presentation:title',
                    name: 'Title',
                    key: 'title',
                    description: 'Specify the document title of the HTML-Presentation.',
                },
                {
                    id: 'presentation:author',
                    name: 'Author',
                    key: 'author',
                    description: 'Specify the author `meta`-tag of the HTML-Presentation.',
                },
                {
                    id: 'presentation:defaults',
                    name: 'Defaults',
                    key: 'defaults',
                    description:
                        'Provide default values for the slides. A default value is used, if the same key does not exist on the slide.',
                },
            ],
        },
    ]

    return (
        <ItemsTemplateConfigurable
            layoutsConfig={items}
            placeholder="Search presentation properties..."
            emptyText="No presentation properties found."
            onSelect={item => props.editorRef.onAddDataTag(item.key, true)}
        >
            Presentation
        </ItemsTemplateConfigurable>
    )
}

function ItemsHeadings(props: { editorRef: CodeMirrorEditorRef }) {
    const { editorRef } = props

    useEventListener('keydown', event => {
        const commandKeyPressed = window.ipc.os.isMac ? event.metaKey : event.ctrlKey
        if (!commandKeyPressed) return

        if (event.key === '1') {
            blockH1(editorRef)
        } else if (event.key === '2') {
            blockH2(editorRef)
        } else if (event.key === '3') {
            blockH3(editorRef)
        } else if (event.key === '4') {
            blockH4(editorRef)
        }
    })

    return (
        <ToolbarItems>
            <ToolbarItemsButton>Headings</ToolbarItemsButton>
            <ToolbarItemsContent>
                <ToolbarItemsSearch placeholder="Search headings..." />
                <ToolbarItemsList>
                    <ToolbarItemGroup heading="Headings">
                        <ToolbarItem
                            value={{ id: 'block:h1' }}
                            searchValues={['format h1', 'format heading 1', 'format title']}
                            onSelect={() => blockH1(editorRef)}
                        >
                            <strong># Title</strong>
                            <ToolbarShortcut cmdCtrl letter="1" />
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'block:h2' }}
                            searchValues={['format h2', 'format heading 2', 'format subtitle']}
                            onSelect={() => blockH2(editorRef)}
                        >
                            <strong>## Subtitle</strong>
                            <ToolbarShortcut cmdCtrl letter="2" />
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'block:h3' }}
                            searchValues={['format h3', 'format heading 3']}
                            onSelect={() => blockH3(editorRef)}
                        >
                            <strong>### Heading</strong>
                            <ToolbarShortcut cmdCtrl letter="3" />
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'block:h4' }}
                            searchValues={['format h4', 'format heading 4', 'format subheading']}
                            onSelect={() => blockH4(editorRef)}
                        >
                            <strong>#### Subheading</strong>
                            <ToolbarShortcut cmdCtrl letter="4" />
                        </ToolbarItem>
                    </ToolbarItemGroup>
                </ToolbarItemsList>
                <ToolbarItemsEmpty>No headings found.</ToolbarItemsEmpty>
            </ToolbarItemsContent>
        </ToolbarItems>
    )
}

function ItemsFormat(props: { editorRef: CodeMirrorEditorRef }) {
    const { editorRef } = props

    useEventListener('keydown', event => {
        const commandKeyPressed = window.ipc.os.isMac ? event.metaKey : event.ctrlKey
        if (!commandKeyPressed) return

        if (event.key === 'b') {
            formatStrong(editorRef)
        } else if (event.key === 'i') {
            formatEmphasize(editorRef)
        } else if (event.key === 'k') {
            formatLink(editorRef)
        } else if (event.key === 'u') {
            formatStrikethrough(editorRef)
        } else if (event.key === '$') {
            if (event.shiftKey) formatMathBlock(editorRef)
            else formatMathInline(editorRef)
        } else if (event.key === 'j') {
            if (event.shiftKey) formatCodeBlock(editorRef)
            else formatCodeInline(editorRef)
        } else if (event.key === 'l') {
            if (event.shiftKey) blockOl(editorRef)
            else blockUl(editorRef)
        } else if (event.key === '<') {
            blockBlockquote(editorRef)
        }
    })

    return (
        <ToolbarItems>
            <ToolbarItemsButton>Format</ToolbarItemsButton>
            <ToolbarItemsContent>
                <ToolbarItemsSearch placeholder="Search format..." />
                <ToolbarItemsList>
                    <ToolbarItemGroup heading="Format">
                        <ToolbarItem
                            value={{ id: 'format:strong' }}
                            searchValues={['format strong', 'format bold']}
                            onSelect={() => formatStrong(editorRef)}
                        >
                            <strong>**Strong**</strong>
                            <ToolbarShortcut cmdCtrl letter="B" />
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'format:emphasize' }}
                            searchValues={['format emphasize', 'format emphasise', 'format italic']}
                            onSelect={() => formatEmphasize(editorRef)}
                        >
                            <em>*Emphasize*</em>
                            <ToolbarShortcut cmdCtrl letter="I" />
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'format:strikethrough' }}
                            searchValues={['format strikethrough', 'format strike-through']}
                            onSelect={() => formatStrikethrough(editorRef)}
                        >
                            <s>~~Strikethrough</s>
                            <ToolbarShortcut cmdCtrl letter="U" />
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'format:link' }}
                            searchValues={['format link', 'format url']}
                            onSelect={() => formatLink(editorRef)}
                        >
                            [Link](https://...)
                            <ToolbarShortcut cmdCtrl letter="K" />
                        </ToolbarItem>
                    </ToolbarItemGroup>
                    <ToolbarItemSeparator />
                    <ToolbarItemGroup heading="Code and Math">
                        <ToolbarItem
                            value={{ id: 'format:code-inline' }}
                            searchValues={['format code inline']}
                            onSelect={() => formatCodeInline(editorRef)}
                        >
                            `Code`
                            <ToolbarShortcut cmdCtrl letter="J" />
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'format:code-block' }}
                            searchValues={['format code block']}
                            onSelect={() => formatCodeBlock(editorRef)}
                        >
                            ```Code Block```
                            <ToolbarShortcut cmdCtrl shift letter="J" />
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'format:math-inline' }}
                            searchValues={['format math inline']}
                            onSelect={() => formatMathInline(editorRef)}
                        >
                            $Math$
                            <ToolbarShortcut cmdCtrl letter="$" />
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'format:math-block' }}
                            searchValues={['format math block']}
                            onSelect={() => formatMathBlock(editorRef)}
                        >
                            $$Math Block$$
                            <ToolbarShortcut cmdCtrl shift letter="$" />
                        </ToolbarItem>
                    </ToolbarItemGroup>
                    <ToolbarItemSeparator />
                    <ToolbarItemGroup heading="Blocks">
                        <ToolbarItem
                            value={{ id: 'block:ol' }}
                            searchValues={['format ol', 'format ordered list']}
                            onSelect={() => blockOl(editorRef)}
                        >
                            1. Ordered List
                            <ToolbarShortcut cmdCtrl shift letter="L" />
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'block:ul' }}
                            searchValues={['format ul', 'format unordered list']}
                            onSelect={() => blockUl(editorRef)}
                        >
                            - Unordered List
                            <ToolbarShortcut cmdCtrl letter="L" />
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'block:blockquote' }}
                            searchValues={['format blockquote', 'format quote']}
                            onSelect={() => blockBlockquote(editorRef)}
                        >
                            &gt; Blockquote
                            <ToolbarShortcut cmdCtrl letter="<" />
                        </ToolbarItem>
                    </ToolbarItemGroup>
                </ToolbarItemsList>
                <ToolbarItemsEmpty>No format found.</ToolbarItemsEmpty>
            </ToolbarItemsContent>
        </ToolbarItems>
    )
}

function ItemsTemplateConfigurable<
    Item extends ToolbarItemType & ToolbarItemValue,
    Group extends { items: Item[] } & ToolbarEntry
>(props: {
    layoutsConfig: Group[]
    children: React.ReactNode
    placeholder?: string
    emptyText?: string
    onSelect?: (value: Item, group: Group) => void
}) {
    const { layoutsConfig, children, placeholder, emptyText, onSelect } = props

    return (
        <ToolbarItems>
            <ToolbarItemsButton>{children}</ToolbarItemsButton>
            <ToolbarItemsContent>
                <ToolbarItemsSearch placeholder={placeholder} />
                <ToolbarItemsList>
                    {layoutsConfig.map((layout, idx, layouts) => (
                        <>
                            <ToolbarItemGroup
                                heading={
                                    <div className="flex justify-between items-center space-x-2">
                                        <span>{layout.name}</span>
                                        {layout.description && <HelpTooltip helpText={layout.description} />}
                                    </div>
                                }
                            >
                                {layout.items.map(item => (
                                    <ToolbarItem
                                        value={item}
                                        searchValues={[item.key, layout.name, item.name].filter(isNonNullable)}
                                        hidden={item.hidden}
                                        onSelect={() => onSelect?.(item, layout)}
                                    >
                                        <div className="flex-grow flex justify-between items-center space-x-2">
                                            <span>{buildItemLabel(item)}</span>
                                            {item.description && <HelpTooltip helpText={item.description} />}
                                        </div>
                                    </ToolbarItem>
                                ))}
                            </ToolbarItemGroup>
                            {idx < layouts.length - 1 && <ToolbarItemSeparator />}
                        </>
                    ))}
                </ToolbarItemsList>
                {emptyText && <ToolbarItemsEmpty>{emptyText}</ToolbarItemsEmpty>}
            </ToolbarItemsContent>
        </ToolbarItems>
    )
}

export function MarkdownToolbar(props: { templateConfig?: TemplateConfig; editorRef?: CodeMirrorEditorRef }) {
    const toolbar = props.templateConfig?.toolbar
    const editorRef = props.editorRef
    return (
        <Toolbar>
            {toolbar?.layouts && (
                <ItemsTemplateConfigurable<ToolbarLayoutItem, ToolbarLayoutEntry>
                    layoutsConfig={toolbar.layouts}
                    placeholder="Search layouts..."
                    emptyText="No layout found."
                    onSelect={item => editorRef?.onAddSlide(item.key, item.slots)}
                >
                    <Plus strokeWidth={2.5} className="w-5 h-5 p-0.5" />
                </ItemsTemplateConfigurable>
            )}
            {editorRef && <ItemsPresentation editorRef={editorRef} />}
            {editorRef && <ItemsHeadings editorRef={editorRef} />}
            {editorRef && <ItemsFormat editorRef={editorRef} />}

            {toolbar?.styles && (
                <ItemsTemplateConfigurable
                    layoutsConfig={toolbar.styles}
                    placeholder="Search styles..."
                    emptyText="No style found."
                    onSelect={editorRef?.onAddAttribute}
                >
                    Styles
                </ItemsTemplateConfigurable>
            )}

            {toolbar?.animation && (
                <ItemsTemplateConfigurable
                    layoutsConfig={toolbar.animation}
                    placeholder="Search animations..."
                    emptyText="No animation found."
                    onSelect={editorRef?.onAddAttribute}
                >
                    Animation
                </ItemsTemplateConfigurable>
            )}

            {toolbar?.slide && (
                <ItemsTemplateConfigurable
                    layoutsConfig={toolbar.slide}
                    placeholder="Search slide properties..."
                    emptyText="No slide properties found."
                    onSelect={item => editorRef?.onAddDataTag(item.key)}
                >
                    Slide
                </ItemsTemplateConfigurable>
            )}
            {toolbar?.slideStyles && (
                <ItemsTemplateConfigurable
                    layoutsConfig={toolbar.slideStyles}
                    placeholder="Search slide styles..."
                    emptyText="No slide styles found."
                    onSelect={editorRef?.onAddClass}
                >
                    Slide Styles
                </ItemsTemplateConfigurable>
            )}
            {editorRef && <ToolbarButton onClick={async () => await selectMedia(editorRef)}>Media</ToolbarButton>}
        </Toolbar>
    )
}

function buildItemLabel(item: { name?: string; key?: string }): string {
    const parts: (string | undefined)[] = []

    if (item.name) {
        parts.push(item.name)
    }

    if (item.key?.trim()) {
        parts.push(`(${item.key})`)
    }

    return parts.join(' ')
}
