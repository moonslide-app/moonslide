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
        <div className="bg-red-100 text-red-500">
            <div className="flex justify-between items-baseline space-x-4 border-b border-red-200 p-2">
                <p>{`${highLevelMessage}`}</p>
                {hasDetails && (
                    <button
                        className="text-sm font-medium flex items-center "
                        onClick={() => setShowDetails(details => !details)}
                    >
                        <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
                        {showDetails ? <ChevronDownIcon size={20} /> : <ChevronUpIcon size={20} />}
                    </button>
                )}
            </div>

            {hasDetails && showDetails && (
                <p className="p-2 whitespace-pre-line text-sm leading-tight">{`${detailedMessage ?? ''}`}</p>
            )}
        </div>
    ) : (
        <></>
    )
}
