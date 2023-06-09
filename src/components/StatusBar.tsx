export type StatusBarProps = {
    leadingText?: string
}

export function StatusBar(props: StatusBarProps) {
    return (
        <div className="bg-background-secondary text-foreground-primary text-xs border-t border-background-tertiary">
            <div className="flex justify-between items-center px-3 py-1">
                <p>{`${props.leadingText ?? ''}`}</p>
            </div>
        </div>
    )
}
