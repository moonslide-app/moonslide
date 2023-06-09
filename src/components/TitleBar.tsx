import { Columns, PanelLeftClose, PanelRightClose, Play, RefreshCcw } from 'lucide-react'
import { ReactNode } from 'react'

export type TitleBarProps = {
    windowTitle?: string
    onUndo?: () => void
    onRedo?: () => void
    onRestorePanes?: () => void
    onPanelLeftToggle?: () => void
    onPanelRightToggle?: () => void
    onReload?: () => void
    onPresent?: () => void
}

export function TitleBar(props: TitleBarProps) {
    return (
        <div className="flex flex-row justify-between items-center space-b bg-background-secondary h-9 text-sm text-foreground-secondary draggable">
            <div className="flex flex-row w-[20%] min-w-min h-full items-center justify-start">
                <div className="window-controls-container" />
                <div className="flex flex-row flex-grow w-[20%] justify-start px-2 space-x-1">
                    <TitleBarIcon action={props.onPanelLeftToggle} title="Toggle Left Pane">
                        <PanelLeftClose className="w-full h-full" />
                    </TitleBarIcon>
                    <TitleBarIcon action={props.onRestorePanes} title="Restore Panes">
                        <Columns className="w-full h-full" />
                    </TitleBarIcon>
                    <TitleBarIcon action={props.onPanelRightToggle} title="Toggle Right Pane">
                        <PanelRightClose className="w-full h-full" />
                    </TitleBarIcon>

                    {/* <TitleBarIcon action={props.onUndo}>
                        <Undo className="w-full h-full" />
                    </TitleBarIcon>
                    <TitleBarIcon action={props.onRedo}>
                        <Redo className="w-full h-full" />
                    </TitleBarIcon> */}
                </div>
            </div>
            <div className="flex flex-row w-[60%] min-w-0 h-full items-center justify-center px-2">
                <div className="whitespace-nowrap text-ellipsis overflow-hidden flex-shrink hidden show-mac">
                    {props.windowTitle && props.windowTitle}
                </div>
            </div>
            <div className="flex flex-row w-[20%] min-w-min h-full items-center justify-end px-2 space-x-1">
                <TitleBarIcon action={props.onReload} title="Reload All Previews">
                    <RefreshCcw className="w-full h-full" />
                </TitleBarIcon>
                <TitleBarIcon action={props.onPresent} title="Open Preview Window">
                    <Play className="w-full h-full" />
                </TitleBarIcon>
            </div>
        </div>
    )
}

export type TitleBarIconProps = {
    children: ReactNode
    action?: () => void
    title?: string
}

export function TitleBarIcon(props: TitleBarIconProps) {
    return (
        <button
            className="non-draggable text-foreground-tertiary h-6 w-6 p-1 rounded-sm hover:bg-background-tertiary active:bg-background-quaternary"
            onClick={props.action}
            title={props.title}
        >
            {props.children}
        </button>
    )
}

export function TitleBarSpacer() {
    return <div className="w-3"></div>
}
