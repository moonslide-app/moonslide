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
                <TooltipContent>
                    <p>{props.helpText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
