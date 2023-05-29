import * as React from 'react'
import * as ToolbarPrimitive from '@radix-ui/react-toolbar'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Command as CommandPrimitive } from 'cmdk'
import { Search } from 'lucide-react'
import { Actions, useMap } from 'usehooks-ts'

import { cn } from '../../lib/utils'

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
            'flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
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

    const filter = (value: string, seach: string) => {
        const values = searchValues.get(value)
        return values?.find(v => v.includes(seach)) ? 1 : 0
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

const ToolbarItem = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & { value: string; searchValues: string[] }
>(({ className, onSelect, value, searchValues: newSearchValues, ...props }, ref) => {
    const [, setOpen] = React.useContext(ToolbarOpenContext) ?? []
    const [searchValues, searchValueActions] = React.useContext(SearchValuesContext) ?? []
    if (searchValues?.get(value) !== newSearchValues) searchValueActions?.set(value, newSearchValues)

    return (
        <CommandPrimitive.Item
            ref={ref}
            className={cn(
                'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className
            )}
            onSelect={(v: string) => {
                if (onSelect) onSelect(v)
                if (setOpen) setOpen(false)
            }}
            value={value}
            {...props}
        />
    )
})

ToolbarItem.displayName = CommandPrimitive.Item.displayName

const ToolbarItemShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
    return <span className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)} {...props} />
}
ToolbarItemShortcut.displayName = 'ToolbarItemShortcut'

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
    ToolbarItemShortcut,
}
