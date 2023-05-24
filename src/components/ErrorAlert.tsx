import { useEditorStore } from '../store'

export function ErrorAlert() {
    const parsingError = useEditorStore(state => state.parsingError)

    return <div>{`${parsingError}`}</div>
}
