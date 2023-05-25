import { useEffect, useState } from 'react'
import {
    MissingStartSeparatorError,
    WrappedError,
    YamlConfigError,
    isWrappedError,
} from '../../src-shared/errors/WrappedError'
import { useEditorStore } from '../store'
import { Button } from './ui/button'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

export function ErrorAlert() {
    const parsingError = useEditorStore(state => state.parsingError)

    let highLevelMessage: string | undefined = undefined
    let detailedMessage: string | undefined = undefined
    if (isWrappedError(parsingError)) {
        highLevelMessage = parsingError.message
        detailedMessage = parsingError.underlyingErrorMessage
    } else if (parsingError instanceof Error) {
        highLevelMessage = parsingError.message
    } else if (typeof parsingError === 'string') {
        highLevelMessage = parsingError
    } else if (parsingError) {
        highLevelMessage = 'An unknown error occurred.'
    }

    const isDisplayed = highLevelMessage !== undefined
    const hasDetails = detailedMessage !== undefined
    const [showDetails, setShowDetails] = useState(false)

    useEffect(() => {
        if (!isDisplayed || !hasDetails) setShowDetails(false)
    }, [isDisplayed, hasDetails])

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
