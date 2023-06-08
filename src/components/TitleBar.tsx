export function TitleBar() {
    return (
        <div className="flex flex-row justify-between items-center space-b bg-secondary h-9 border-b border-border text-secondary-foreground window-draggable">
            <div className="flex flex-row w-[20%] justify-start px-4">
                <div className="window-controls-container" />
                Left
            </div>
            <div className="flex flex-row w-[60%] justify-center px-4">Center</div>
            <div className="flex flex-row w-[20%] justify-end px-4">Right</div>
        </div>
    )
}
