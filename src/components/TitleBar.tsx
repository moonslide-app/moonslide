import { Columns, PanelLeftClose, PanelRightClose, Play, Redo, RefreshCcw, Undo } from 'lucide-react'
import { ReactNode } from 'react'

export type TitleBarProps = {
    documentTitle?: string
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
        <div className="flex flex-row justify-between items-center space-b bg-secondary h-9 text-sm text-secondary-foreground draggable">
            <div className="flex flex-row w-[20%] min-w-min h-full items-center justify-start">
                <div className="window-controls-container" />
                <div className="flex flex-row flex-grow w-[20%] justify-start px-2 space-x-1">
                    <TitleBarIcon action={props.onPanelLeftToggle}>
                        <PanelLeftClose className="w-full h-full" />
                    </TitleBarIcon>
                    <TitleBarIcon action={props.onRestorePanes}>
                        <Columns className="w-full h-full" />
                    </TitleBarIcon>
                    <TitleBarIcon action={props.onPanelRightToggle}>
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
                    {props.documentTitle && `${props.documentTitle} — `}Moonslide
                </div>
            </div>
            <div className="flex flex-row w-[20%] min-w-min h-full items-center justify-end px-2 space-x-1">
                <TitleBarIcon action={props.onReload}>
                    <RefreshCcw className="w-full h-full" />
                </TitleBarIcon>
                <TitleBarIcon action={props.onPresent}>
                    <Play className="w-full h-full" />
                </TitleBarIcon>
            </div>
        </div>
    )
}

export type TitleBarIconProps = {
    children: ReactNode
    action?: () => void
}

export function TitleBarIcon(props: TitleBarIconProps) {
    return (
        <button className="non-draggable text-gray-400 h-6 w-6 rounded-sm hover:bg-gray-200 p-1" onClick={props.action}>
            {props.children}
        </button>
    )
}

export function TitleBarSpacer() {
    return <div className="w-3"></div>
}
