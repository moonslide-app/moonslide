import { ExternalLinkIcon, InfoIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import ReactMarkdown from 'react-markdown'

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
    return (
        <ReactMarkdown
            className="text-gray-700 font-normal text-sm"
            components={{
                code({ children }) {
                    return <pre className="inline py-0.5 px-1 rounded-sm bg-gray-200 text-xs">{children}</pre>
                },
                a({ href, children }) {
                    return (
                        <a href={href} target="_blank" className="font-bold hover:underline hover:text-gray-600">
                            {children}
                            <ExternalLinkIcon className="inline h-3 -mx-1 mb-0.5" />
                        </a>
                    )
                },
            }}
        >
            {props.text}
        </ReactMarkdown>
    )
}
