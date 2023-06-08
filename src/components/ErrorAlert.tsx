import { useState } from 'react'
import { useEditorStore } from '../store'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { getErrorMessage } from '../../src-shared/errors/errorMessage'

export function ErrorAlert() {
    const parsingError = useEditorStore(state => state.parsingError)

    const errorMessage = parsingError ? getErrorMessage(parsingError) : undefined
    const highLevelMessage = errorMessage?.highLevelMessage
    const detailedMessage = errorMessage?.detailedMessage

    const isDisplayed = highLevelMessage !== undefined
    const hasDetails = detailedMessage !== undefined
    const [showDetails, setShowDetails] = useState(false)

    return isDisplayed ? (
        <div className="bg-destructive text-destructive-foreground text-xs border-t border-background-tertiary">
            <div className="flex justify-between items-baseline space-x-4 px-3 py-1">
                <p>{`${highLevelMessage}`}</p>
                {hasDetails && (
                    <button
                        className="font-medium flex items-center space-x-2"
                        onClick={() => setShowDetails(details => !details)}
                    >
                        <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
                        {showDetails ? <ChevronDownIcon size={16} /> : <ChevronUpIcon size={16} />}
                    </button>
                )}
            </div>

            {hasDetails && showDetails && (
                <div className="border-t border-destructive-border">
                    <p className="px-3 py-1 whitespace-pre-line leading-tight">{`${detailedMessage ?? ''}`}</p>
                </div>
            )}
        </div>
    ) : (
        <></>
    )
}
