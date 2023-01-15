const recursiveRemoveProtection = (setBoardState) => {
    setBoardState(prev => {
        let proSq = Object.values(prev).filter((item) => {
            return item.state === 'protected'
        }).map(item => item.id)
        for (const sq of proSq) {
            prev[sq].state = prev[sq].oldState
        }
        return { ...prev }
    })
}

export default recursiveRemoveProtection