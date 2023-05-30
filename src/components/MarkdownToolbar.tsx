import { isNonNullable } from '../../src-shared/entities/utils'
import { TemplateConfig, ToolbarEntryConfig } from '../../src-shared/entities/TemplateConfig'
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
} from './ui/toolbar'
import { CodeMirrorEditorRef } from './CodeMirrorEditor'
import {
    blockBlockquote,
    blockH1,
    blockH2,
    blockH3,
    blockH4,
    blockOl,
    blockTaskList,
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

function ItemsFormat(props: { editorRef: CodeMirrorEditorRef }) {
    const { editorRef } = props
    return (
        <ToolbarItems>
            <ToolbarItemsButton>Format</ToolbarItemsButton>
            <ToolbarItemsContent>
                <ToolbarItemsSearch placeholder="Search format..." />
                <ToolbarItemsList>
                    <ToolbarItemGroup>
                        <ToolbarItem
                            value="format:strong"
                            searchValues={['format strong', 'format bold']}
                            onSelect={() => formatStrong(editorRef)}
                        >
                            <strong>**Strong**</strong>
                        </ToolbarItem>
                        <ToolbarItem
                            value="format:emphasize"
                            searchValues={['format emphasize', 'format emphasise', 'format italic']}
                            onSelect={() => formatEmphasize(editorRef)}
                        >
                            <em>*Emphasize*</em>
                        </ToolbarItem>
                        <ToolbarItem
                            value="format:strikethrough"
                            searchValues={['format strikethrough', 'format strike-through']}
                            onSelect={() => formatStrikethrough(editorRef)}
                        >
                            <s>~~Strikethrough</s>
                        </ToolbarItem>
                        <ToolbarItem
                            value="format:link"
                            searchValues={['format link', 'format url']}
                            onSelect={() => formatLink(editorRef)}
                        >
                            [Link](https://...)
                        </ToolbarItem>
                        <ToolbarItem
                            value="format:code-inline"
                            searchValues={['format code inline']}
                            onSelect={() => formatCodeInline(editorRef)}
                        >
                            `Code`
                        </ToolbarItem>
                        <ToolbarItem
                            value="format:code-block"
                            searchValues={['format code block']}
                            onSelect={() => formatCodeBlock(editorRef)}
                        >
                            ```Code Block```
                        </ToolbarItem>
                        <ToolbarItem
                            value="format:math-inline"
                            searchValues={['format math inline']}
                            onSelect={() => formatMathInline(editorRef)}
                        >
                            $Math$
                        </ToolbarItem>
                        <ToolbarItem
                            value="format:math-block"
                            searchValues={['format math block']}
                            onSelect={() => formatMathBlock(editorRef)}
                        >
                            $$Math Block$$
                        </ToolbarItem>
                    </ToolbarItemGroup>
                </ToolbarItemsList>
                <ToolbarItemsEmpty>No format found.</ToolbarItemsEmpty>
            </ToolbarItemsContent>
        </ToolbarItems>
    )
}

function ItemsBlock(props: { editorRef: CodeMirrorEditorRef }) {
    const { editorRef } = props
    return (
        <ToolbarItems>
            <ToolbarItemsButton>Block</ToolbarItemsButton>
            <ToolbarItemsContent>
                <ToolbarItemsSearch placeholder="Search block..." />
                <ToolbarItemsList>
                    <ToolbarItemGroup heading="Headings">
                        <ToolbarItem
                            value="block:h1"
                            searchValues={['format h1', 'format heading 1', 'format title']}
                            onSelect={() => blockH1(editorRef)}
                        >
                            <strong># Title</strong>
                        </ToolbarItem>
                        <ToolbarItem
                            value="block:h2"
                            searchValues={['format h2', 'format heading 2', 'format subtitle']}
                            onSelect={() => blockH2(editorRef)}
                        >
                            <strong>## Subtitle</strong>
                        </ToolbarItem>
                        <ToolbarItem
                            value="block:h3"
                            searchValues={['format h3', 'format heading 3']}
                            onSelect={() => blockH3(editorRef)}
                        >
                            <strong>### Heading</strong>
                        </ToolbarItem>
                        <ToolbarItem
                            value="block:h4"
                            searchValues={['format h4', 'format heading 4', 'format subheading']}
                            onSelect={() => blockH4(editorRef)}
                        >
                            <strong>#### Subheading</strong>
                        </ToolbarItem>
                    </ToolbarItemGroup>
                    <ToolbarItemSeparator />
                    <ToolbarItemGroup heading="Lists">
                        <ToolbarItem
                            value="block:ol"
                            searchValues={['format ol', 'format ordered list']}
                            onSelect={() => blockOl(editorRef)}
                        >
                            1. Ordered List
                        </ToolbarItem>
                        <ToolbarItem
                            value="block:ul"
                            searchValues={['format ul', 'format unordered list']}
                            onSelect={() => blockUl(editorRef)}
                        >
                            - Unordered List
                        </ToolbarItem>
                        <ToolbarItem
                            value="block:task-list"
                            searchValues={['format task list', 'format task-list']}
                            onSelect={() => blockTaskList(editorRef)}
                        >
                            - [ ] Task List
                        </ToolbarItem>
                    </ToolbarItemGroup>
                    <ToolbarItemGroup heading="Blocks">
                        <ToolbarItem
                            value="block:blockquote"
                            searchValues={['format blockquote', 'format quote']}
                            onSelect={() => blockBlockquote(editorRef)}
                        >
                            &gt; Blockquote
                        </ToolbarItem>
                    </ToolbarItemGroup>
                </ToolbarItemsList>
                <ToolbarItemsEmpty>No block found.</ToolbarItemsEmpty>
            </ToolbarItemsContent>
        </ToolbarItems>
    )
}

function ItemsTemplateConfigurable(props: {
    layoutsConfig: ToolbarEntryConfig
    buttonTitle: string
    placeholder?: string
    emptyText?: string
    onSelect?: (attribute: string) => void
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
                            <ToolbarItemGroup heading={layout.name}>
                                {layout.items.map(item => (
                                    <ToolbarItem
                                        value={item.key}
                                        searchValues={[item.key, layout.name, item.displayName].filter(isNonNullable)}
                                        hidden={item.hidden}
                                        onSelect={onSelect}
                                    >
                                        {item.displayName ? `${item.displayName} (${item.key})` : item.key}
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
                <ItemsTemplateConfigurable
                    layoutsConfig={toolbar.layouts}
                    buttonTitle="+"
                    placeholder="Search layouts..."
                    emptyText="No layout found."
                    onSelect={editorRef?.onAddSlide}
                />
            )}
            {editorRef && <ItemsFormat editorRef={editorRef} />}
            {editorRef && <ItemsBlock editorRef={editorRef} />}
            {editorRef && <ToolbarButton onClick={async () => await selectMedia(editorRef)}>Media</ToolbarButton>}
            {toolbar?.modifiers && (
                <ItemsTemplateConfigurable
                    layoutsConfig={toolbar.modifiers}
                    buttonTitle="Modifiers"
                    placeholder="Search modifiers..."
                    emptyText="No modifier found."
                    onSelect={editorRef?.onAddModifier}
                />
            )}
            {toolbar?.slideClasses && (
                <ItemsTemplateConfigurable
                    layoutsConfig={toolbar.slideClasses}
                    buttonTitle="Classes"
                    placeholder="Search classes..."
                    emptyText="No class found."
                    onSelect={editorRef?.onAddClass}
                />
            )}
            {toolbar?.dataTags && (
                <ItemsTemplateConfigurable
                    layoutsConfig={toolbar.dataTags}
                    buttonTitle="Data"
                    placeholder="Search data tags..."
                    emptyText="No data tag found."
                    onSelect={editorRef?.onAddDataTag}
                />
            )}
        </Toolbar>
    )
}
