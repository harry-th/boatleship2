const fromEnemy = ({ message, ss }) => {
    console.log({ enemy: message })
    if (message.freeshotmiss || message.freeshotmiss === 0) {
        ss.setFreeShotMiss(message.freeshotmiss)
    }
    if (message.enemyfreeshotmiss || message.enemyfreeshotmiss === 0) {
        ss.setEnemyFreeShotMiss(message.enemyfreeshotmiss)
    }
    if (!message.freeshot) ss.setTurn(true)
    if (message?.shipsSunk?.length > 0) {
        ss.setMessages(prev => {
            return [...prev, `They sunk your ${message.shipsSunk.join('and')}`]
        })
    }
    let index = message.shotresults.missed[0] || message.shotresults.hit[0]

    if (message.shotresults) {
        let { shotresults } = message
        console.log(shotresults)
        ss.setMessages(prev => {
            if (shotresults.hit.length > 1 || shotresults.missed.length > 1) {
                let string = ''
                if (shotresults.hit.length > 0) string += `They fired a volley of shots, they hit at ${shotresults.hit.join(', ')}!`
                if (shotresults.missed.length > 0 && shotresults.hit.length > 0) string += ` And missed here ${shotresults.missed.join(', ')}.`
                else if (shotresults.missed.length > 0) string = `They fired a volley of shots: ${shotresults.missed.join(', ')}, but they all missed!`
                return [...prev, string]
            }
            else if (shotresults.hit.length > 0) return [...prev, `They fired at ${shotresults.hit} and it was a hit!`]
            else if (shotresults.missed.length > 0) return [...prev, `They fired at ${shotresults.missed} but it missed!`]
        })
        ss.setBoardState(prev => {
            for (const shot of message.shotresults.missed) {
                prev[shot].state = 'missed'
            }
            for (const shot of message.shotresults.hit) {
                prev[shot].state = 'hit'
            }
            return { ...prev }
        })
    }

    if (message.bluffArray && !message.callbluff) {
        ss.setBoardState(prev => {
            for (const b of message.bluffArray) {
                prev[b].state = null
            }
            for (const shot of message.shotresults.missed) {
                prev[shot].state = 'missed'
            }
            for (const shot of message.shotresults.hit) {
                prev[shot].state = 'hit'
            }
            return { ...prev }
        })
    } else if (message.bluffArray && message.callbluff === 'success') {
        ss.setMessages(prev => {
            return [...prev, `They called your bluff!`]
        })
        ss.setBluffing(null)
        ss.setEnemyBoardState(prev => {
            for (const shot of message.bluffArray.missed) {
                prev[shot].state = 'missed'
            }
            for (const shot of message.bluffArray.hit) {
                prev[shot].state = 'hit'
            }
            return { ...prev }
        })
    } else if (message.callbluff === 'failure') {
        ss.setMessages(prev => {
            return [...prev, `They tried to call your bluff and failed!`]
        })
    }

    if (message.orange) {
        ss.setEnemyBoardState(prev => {
            if (!message.extrashot) {
                let proSq = Object.values(prev).filter((item) => {
                    return item.state === 'protected'
                }).map(item => item.id)
                for (const sq of proSq) {
                    prev[sq].state = prev[sq].oldState
                    delete prev[sq].oldState
                }
            }
            prev[index].oldState ||= prev[index].state //very weird bug here
            prev[index].state = 'protected'
            return { ...prev }
        })
    }
}

export default fromEnemy