export type StatusBarProps = {
    leadingText?: string
}

export function StatusBar(props: StatusBarProps) {
    return (
        <div className="bg-background text-foreground text-xs border-t border-t-border">
            <div className="flex justify-between items-baseline px-3 py-1">
                <p>{`${props.leadingText ?? ''}`}</p>
            </div>
        </div>
    )
}
