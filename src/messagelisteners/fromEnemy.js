const fromEnemy = ({ message, ss }) => {
    console.log({ enemy: message })
    if (message.messagetype === 'disconnect') {
        ss.setEnemyInfo(prev => {
            if (prev) prev.status = 'disconnected'
            return { ...prev }
        })
        return
    }
    if (message.messagetype === 'reconnect') {
        ss.setEnemyInfo(prev => {
            if (prev.status === 'disconnected') delete prev.status
            return { ...prev }
        })
        return
    }



    if (!message.freeshot) ss.setTurn(true)
    if (message.enemyfreeshotmiss >= 0) ss.setEnemyFreeShotMiss(message.enemyfreeshotmiss)
    ss.setTurnNumber(message.turnNumber)
    ss.setEnemyTurnNumber(message.enemyTurnNumber)
    if (message.bluffing === 'ready') ss.setBluffing(message.bluffing)
    if (message.twoShots) {
        ss.setLastShots(message.twoShots)
    }
    if (message.shotresults) {
        let { shotresults } = message
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
            for (const shots in shotresults) {
                for (const shot of shotresults[shots]) {
                    prev[shot].state = shots
                }
            }
            return { ...prev }
        })

        let { enemyOrangeResults } = message
        ss.setEnemyBoardState(prev => {
            for (const shots in enemyOrangeResults) {
                for (const shot of enemyOrangeResults[shots]) {
                    prev[shot].state = shots
                }
            }
            return { ...prev }
        })
    }
    if (message?.shipsSunk?.length > 0) {
        ss.setMessages(prev => {
            return [...prev, `They sunk your ${message.shipsSunk.join(' and ')}`]
        })
    }

    if (message.bluffArray && message.callbluff === 'success') {
        ss.setMessages(prev => {
            return [...prev, `They called your bluff!`]
        })
        ss.setBluffing('disarmed')
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
        ss.setEnemyFreeShotMiss(message.enemyfreeshotmiss)
    }
}

export default fromEnemy