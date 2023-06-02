import { InfoIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

export type HelpTooltipProps = {
    helpText: string
}

export function HelpTooltip(props: HelpTooltipProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger>
                    <InfoIcon className="text-gray-300 w-4 -my-1" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <HelpTooltipText text={props.helpText} />
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

function HelpTooltipText(props: { text: string }) {
    const splitted = props.text.split(/`(.+?)`/g)
    return (
        <p className="text-gray-700 font-normal text-sm">
            {splitted.map((val, idx) =>
                idx % 2 == 0 ? (
                    <span>{val}</span>
                ) : (
                    <pre className="inline py-0.5 px-1 rounded-sm bg-gray-200 text-xs">{val}</pre>
                )
            )}
        </p>
    )
}
