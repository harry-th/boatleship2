const fromYou = ({ message, ss }) => {
    console.log({ you: message })
    ss.setTurnNumber(message.turnNumber)
    if (message.freeshotmiss >= 0) ss.setFreeShotMiss(message.freeshotmiss)
    if (message.freeshot) ss.setTurn(true)
    if (message.bluffing) ss.setBluffing(message.bluffing)
    if (message.charges || message.charges === 0) ss.setCharges(message.charges)
    if (message.shotresults) {
        let { shotresults } = message
        if (shotresults.hit || shotresults.missed) {
            ss.setMessages(prev => {
                if (message.cornershot && shotresults.hit.length > 1) return [...prev, `You have cornered the boat sinking market!`]
                if (shotresults.hit.length > 1 || shotresults.missed.length > 1) {
                    let string = ''
                    if (shotresults.hit.length > 0) string += `You fired a volley of shots, they hit at ${shotresults.hit.join(', ')}!`
                    if (shotresults.missed.length > 0 && shotresults.hit.length > 0) string += ` And missed here: ${shotresults.missed.join(', ')}.`
                    else if (shotresults.missed.length > 0) string = `You fired a volley of shots: ${shotresults.missed.join(', ')} but they all missed!`
                    return [...prev, string]
                }
                else if (shotresults.hit.length > 0) return [...prev, `You fired at ${shotresults.hit} and it was a hit!`]
                else if (shotresults.missed.length > 0) return [...prev, `You fired at ${shotresults.missed} but it missed!`]
            })
        }
        ss.setEnemyBoardState(prev => {
            for (const shots in shotresults) {
                for (const shot of shotresults[shots]) {
                    prev[shot].state = shots
                }
            }
            return { ...prev }
        })
    }

    let { orangeShotResults } = message
    ss.setBoardState(prev => {
        for (const shots in orangeShotResults) {
            for (const shot of orangeShotResults[shots]) {
                prev[shot].state = shots
            }
        }
        return { ...prev }
    })

    if (message?.shipsSunk?.length > 0) {
        ss.setMessages(prev => {
            return [...prev, `you have sunk their ${message.shipsSunk.join(' and ')}`]
        })
    }
    if (message.callbluff === 'success') {
        ss.setMessages(prev => {
            return [...prev, `You called their bluff!`]
        })
    } else if (message.callbluff === 'failure') {
        ss.setMessages(prev => {
            return [...prev, `they weren't bluffing!`]
        })
        ss.setFreeShotMiss(message.freeshotmiss)
    }
}
export default fromYou