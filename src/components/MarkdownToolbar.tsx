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
} from './ui/toolbar'

export function MarkdownToolbar() {
    return (
        <Toolbar className="m-4">
            <ToolbarItems>
                <ToolbarItemsButton>Format</ToolbarItemsButton>
                <ToolbarItemsContent>
                    <ToolbarItemsSearch placeholder="Search format..." />
                    <ToolbarItemsList>
                        <ToolbarItemGroup>
                            <ToolbarItem
                                value="format:bold"
                                searchValues={['format', 'bold', 'format bold']}
                                onSelect={() => {
                                    alert('make bold')
                                }}
                            >
                                Bold
                            </ToolbarItem>
                            <ToolbarItem
                                value="format:italic"
                                searchValues={['format', 'italic', 'format italic']}
                                onSelect={() => {
                                    alert('make italic')
                                }}
                            >
                                Italic
                            </ToolbarItem>
                        </ToolbarItemGroup>
                    </ToolbarItemsList>
                    <ToolbarItemsEmpty>No format found.</ToolbarItemsEmpty>
                </ToolbarItemsContent>
            </ToolbarItems>
            <ToolbarItems>
                <ToolbarItemsButton>Modifier</ToolbarItemsButton>
                <ToolbarItemsContent>
                    <ToolbarItemsSearch placeholder="Search modifier..." />
                    <ToolbarItemsList>
                        <ToolbarItemGroup heading="Format">
                            <ToolbarItem
                                value="format:bold"
                                searchValues={['format', 'bold', 'format bold']}
                                onSelect={() => {
                                    alert('make bold')
                                }}
                            >
                                Bold
                            </ToolbarItem>
                            <ToolbarItem
                                value="format:italic"
                                searchValues={['format', 'italic', 'format italic', 'test']}
                                onSelect={() => {
                                    alert('make italic')
                                }}
                            >
                                Italic
                            </ToolbarItem>
                        </ToolbarItemGroup>
                    </ToolbarItemsList>
                    <ToolbarItemsEmpty>No modifier found.</ToolbarItemsEmpty>
                </ToolbarItemsContent>
            </ToolbarItems>
        </Toolbar>
    )
}
