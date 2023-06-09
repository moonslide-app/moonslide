import { getErrorMessage } from '../../src-shared/errors/errorMessage'
import { useEffectOnce } from 'usehooks-ts'
import { toast } from './ui/use-toast'

export function GlobalErrors() {
    useEffectOnce(() => {
        window.onunhandledrejection = (event: PromiseRejectionEvent) => {
            const { title, highLevelMessage } = getErrorMessage(event.reason)
            toast({ title, description: highLevelMessage, variant: 'destructive' })
        }
    })

    return null
}
