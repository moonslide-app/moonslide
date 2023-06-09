export type StatusBarProps = {
    leadingText?: string
    action?: () => void
}

export function StatusBar(props: StatusBarProps) {
    return (
        <div className="bg-background-secondary text-foreground-secondary text-xs border-t border-background-tertiary">
            <div className="flex justify-between items-center px-3 pt-1 pb-1.5">
                <p onClick={props.action} className={props.action ? 'cursor-pointer' : ''}>{`${
                    props.leadingText ?? ''
                }`}</p>
            </div>
        </div>
    )
}
