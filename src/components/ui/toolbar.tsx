import * as React from 'react'
import * as ToolbarPrimitive from '@radix-ui/react-toolbar'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Command as CommandPrimitive, useCommandState } from 'cmdk'
import { Search } from 'lucide-react'
import { Actions, useMap } from 'usehooks-ts'

import { cn } from '../../lib/utils'
import { isNonNullable } from '../../../src-shared/entities/utils'

const ToolbarOpenContext = React.createContext<[boolean, (v: boolean) => void] | undefined>(undefined)
const SearchValuesContext = React.createContext<
    [Omit<Map<string, string[]>, 'set' | 'clear' | 'delete'>, Actions<string, string[]>] | undefined
>(undefined)

const Toolbar = React.forwardRef<
    React.ElementRef<typeof ToolbarPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Root>
>(({ className, ...props }, ref) => (
    <ToolbarPrimitive.Root
        ref={ref}
        className={cn('flex h-10 items-center space-x-1 rounded-md border bg-background p-1', className)}
        {...props}
    />
))
Toolbar.displayName = ToolbarPrimitive.Root.displayName

const ToolbarButton = React.forwardRef<
    React.ElementRef<typeof ToolbarPrimitive.Button>,
    React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Button>
>(({ className, ...props }, ref) => (
    <ToolbarPrimitive.Button
        ref={ref}
        className={cn(
            'flex cursor-default select-none items-center rounded-sm p-1.5 text-sm font-medium outline-none hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
            className
        )}
        {...props}
    />
))

const ToolbarItems: React.FC<React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>> = ({
    open,
    onOpenChange,
    ...props
}) => {
    const [contextOpen, setContextOpen] = React.useState(false)

    return (
        <ToolbarOpenContext.Provider value={[contextOpen, setContextOpen]}>
            <PopoverPrimitive.Root
                open={open ?? contextOpen}
                onOpenChange={onOpenChange ?? setContextOpen}
                {...props}
            />
        </ToolbarOpenContext.Provider>
    )
}
ToolbarItems.displayName = PopoverPrimitive.Root.displayName

const ToolbarItemsButton = React.forwardRef<
    React.ElementRef<typeof ToolbarButton>,
    React.ComponentPropsWithoutRef<typeof ToolbarButton>
>(({ className, 'aria-expanded': ariaExpanded, ...props }, ref) => {
    const [open] = React.useContext(ToolbarOpenContext) ?? []

    return (
        <PopoverPrimitive.Trigger asChild>
            <ToolbarButton ref={ref} className={cn(className)} aria-expanded={ariaExpanded ?? open} {...props} />
        </PopoverPrimitive.Trigger>
    )
})

const ToolbarItemsContent = React.forwardRef<
    React.ElementRef<typeof PopoverPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'start', sideOffset = 4, children, ...props }, ref) => {
    const [searchValues, searchValueActions] = useMap<string, string[]>()

    const filter = (value: string, search: string) => {
        const values = searchValues.get(value)?.map(v => v.toLowerCase())
        const searchLowerCased = search.toLowerCase()
        const found = values?.findIndex(v => v.toLowerCase().includes(searchLowerCased))
        return isNonNullable(found) && found !== -1 ? 1 : 0
    }

    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
                ref={ref}
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    'z-50 w-72 rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                    className
                )}
                {...props}
            >
                <SearchValuesContext.Provider value={[searchValues, searchValueActions]}>
                    <CommandPrimitive
                        className="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground"
                        shouldFilter={true}
                        filter={filter}
                        children={children}
                    />
                </SearchValuesContext.Provider>
            </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
    )
})
ToolbarItemsContent.displayName = PopoverPrimitive.Content.displayName

const ToolbarItemsSearch = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Input>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandPrimitive.Input
            ref={ref}
            className={cn(
                'placeholder:text-foreground-muted flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        />
    </div>
))

ToolbarItemsSearch.displayName = CommandPrimitive.Input.displayName

const ToolbarItemsList = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.List
        ref={ref}
        className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
        {...props}
    />
))

ToolbarItemsList.displayName = CommandPrimitive.List.displayName

const ToolbarItemsEmpty = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Empty>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />)

ToolbarItemsEmpty.displayName = CommandPrimitive.Empty.displayName

React.createFactory

const ToolbarItemGroup = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Group>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Group
        ref={ref}
        className={cn(
            'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
            className
        )}
        {...props}
    />
))

ToolbarItemGroup.displayName = CommandPrimitive.Group.displayName

const ToolbarItemSeparator = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Separator ref={ref} className={cn('-mx-1 h-px bg-border', className)} {...props} />
))
ToolbarItemSeparator.displayName = CommandPrimitive.Separator.displayName

type ToolbarItemValue = {
    id: string
}

type ToolbarItemProps<T extends ToolbarItemValue> = Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>,
    'value' | 'onSelect'
> & {
    value: T
    onSelect?: (value: T | undefined) => void
    searchValues: string[]
    hidden?: boolean
}

interface ToolbarItemForwarded extends React.FC<ToolbarItemProps<ToolbarItemValue>> {
    <T extends ToolbarItemValue>(props: ToolbarItemProps<T>): ReturnType<React.FC<ToolbarItemProps<T>>>
}

const ToolbarItem: ToolbarItemForwarded = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Item>,
    ToolbarItemProps<ToolbarItemValue>
>(({ className, onSelect, value, searchValues: newSearchValues, hidden, ...props }, ref) => {
    const search = useCommandState(state => state.search)
    const [, setOpen] = React.useContext(ToolbarOpenContext) ?? []
    const [searchValues, searchValueActions] = React.useContext(SearchValuesContext) ?? []
    if (searchValues?.get(value.id) !== newSearchValues) searchValueActions?.set(value.id, newSearchValues)

    if (hidden && !search) return null

    return (
        <CommandPrimitive.Item
            ref={ref}
            className={cn(
                'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className
            )}
            onSelect={() => {
                if (onSelect) onSelect(value)
                if (setOpen) setOpen(false)
            }}
            value={value.id}
            {...props}
        />
    )
})

ToolbarItem.displayName = CommandPrimitive.Item.displayName

export type ToolbarShortcutProps = React.HTMLAttributes<HTMLSpanElement> & {
    shift?: boolean
    /**
     * Command on mac, control on windows
     */
    cmdCtrl?: boolean
    alt?: boolean
    letter?: string
}

const ToolbarShortcut = ({ className, children, shift, cmdCtrl, alt, letter, ...props }: ToolbarShortcutProps) => {
    function getCommandName() {
        if (window.ipc.os.isMac) return `${shift ? '⇧' : ''}${alt ? '⌥' : ''}${cmdCtrl ? '⌘' : ''}${letter ?? ''}`
        else return `${shift ? 'Shift+' : ''}${alt ? 'Alt+' : ''}${cmdCtrl ? 'Ctrl+' : ''}${letter ?? ''}`
    }

    return (
        <span className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)} {...props}>
            {children ?? getCommandName()}
        </span>
    )
}
ToolbarShortcut.displayName = 'ToolbarShortcut'

export type { ToolbarItemValue }

export {
    Toolbar,
    ToolbarButton,
    ToolbarItems,
    ToolbarItemsButton,
    ToolbarItemsContent,
    ToolbarItemsEmpty,
    ToolbarItemsList,
    ToolbarItemsSearch,
    ToolbarItem,
    ToolbarItemGroup,
    ToolbarItemSeparator,
    ToolbarShortcut,
}
