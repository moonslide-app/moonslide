export function restart() {
    let config
    return {
        name: 'electron-restart',
        configResolved(_config) {
            config = _config
        },
        closeBundle() {
            if (config.mode === 'production') {
                return
            }
            process.stdin.emit('data', 'rs')
        },
    }
}
