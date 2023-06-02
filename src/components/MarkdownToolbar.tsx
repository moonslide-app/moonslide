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
} from './ui/toolbar'
import { CodeMirrorEditorRef } from './CodeMirrorEditor'
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

function ItemsHeadings(props: { editorRef: CodeMirrorEditorRef }) {
    const { editorRef } = props
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
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'block:h2' }}
                            searchValues={['format h2', 'format heading 2', 'format subtitle']}
                            onSelect={() => blockH2(editorRef)}
                        >
                            <strong>## Subtitle</strong>
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'block:h3' }}
                            searchValues={['format h3', 'format heading 3']}
                            onSelect={() => blockH3(editorRef)}
                        >
                            <strong>### Heading</strong>
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'block:h4' }}
                            searchValues={['format h4', 'format heading 4', 'format subheading']}
                            onSelect={() => blockH4(editorRef)}
                        >
                            <strong>#### Subheading</strong>
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
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'format:emphasize' }}
                            searchValues={['format emphasize', 'format emphasise', 'format italic']}
                            onSelect={() => formatEmphasize(editorRef)}
                        >
                            <em>*Emphasize*</em>
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'format:strikethrough' }}
                            searchValues={['format strikethrough', 'format strike-through']}
                            onSelect={() => formatStrikethrough(editorRef)}
                        >
                            <s>~~Strikethrough</s>
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'format:link' }}
                            searchValues={['format link', 'format url']}
                            onSelect={() => formatLink(editorRef)}
                        >
                            [Link](https://...)
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
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'format:code-block' }}
                            searchValues={['format code block']}
                            onSelect={() => formatCodeBlock(editorRef)}
                        >
                            ```Code Block```
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'format:math-inline' }}
                            searchValues={['format math inline']}
                            onSelect={() => formatMathInline(editorRef)}
                        >
                            $Math$
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'format:math-block' }}
                            searchValues={['format math block']}
                            onSelect={() => formatMathBlock(editorRef)}
                        >
                            $$Math Block$$
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
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'block:ul' }}
                            searchValues={['format ul', 'format unordered list']}
                            onSelect={() => blockUl(editorRef)}
                        >
                            - Unordered List
                        </ToolbarItem>
                        <ToolbarItem
                            value={{ id: 'block:blockquote' }}
                            searchValues={['format blockquote', 'format quote']}
                            onSelect={() => blockBlockquote(editorRef)}
                        >
                            &gt; Blockquote
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
    Layout extends { items: Item[] } & ToolbarEntry
>(props: {
    layoutsConfig: Layout[]
    buttonTitle: string
    placeholder?: string
    emptyText?: string
    onSelect?: (value: Item | undefined) => void
}) {
    const { layoutsConfig, buttonTitle, placeholder, emptyText, onSelect } = props

    return (
        <ToolbarItems>
            <ToolbarItemsButton>{buttonTitle}</ToolbarItemsButton>
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
                                        onSelect={onSelect}
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
        <Toolbar className="m-4">
            {toolbar?.layouts && (
                <ItemsTemplateConfigurable<ToolbarLayoutItem, ToolbarLayoutEntry>
                    layoutsConfig={toolbar.layouts}
                    buttonTitle="+"
                    placeholder="Search layouts..."
                    emptyText="No layout found."
                    onSelect={item => item && editorRef?.onAddSlide(item.key, item.slots)}
                />
            )}
            {editorRef && <ItemsHeadings editorRef={editorRef} />}
            {editorRef && <ItemsFormat editorRef={editorRef} />}

            {toolbar?.textStyles && (
                <ItemsTemplateConfigurable
                    layoutsConfig={toolbar.textStyles}
                    buttonTitle="Text Styles"
                    placeholder="Search text styles..."
                    emptyText="No text style found."
                    onSelect={item => item && editorRef?.onAddAttribute(item.key)}
                />
            )}

            {toolbar?.animation && (
                <ItemsTemplateConfigurable
                    layoutsConfig={toolbar.animation}
                    buttonTitle="Animation"
                    placeholder="Search animations..."
                    emptyText="No animation found."
                    onSelect={item => item && editorRef?.onAddAttribute(item.key)}
                />
            )}

            {toolbar?.slide && (
                <ItemsTemplateConfigurable
                    layoutsConfig={toolbar.slide}
                    buttonTitle="Slide"
                    placeholder="Search slide properties..."
                    emptyText="No slide properties found."
                    onSelect={item => item && editorRef?.onAddDataTag(item.key)}
                />
            )}
            {toolbar?.slideStyles && (
                <ItemsTemplateConfigurable
                    layoutsConfig={toolbar.slideStyles}
                    buttonTitle="Slide Styles"
                    placeholder="Search slide styles..."
                    emptyText="No slide styles found."
                    onSelect={item => item && editorRef?.onAddClass(item.key)}
                />
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
