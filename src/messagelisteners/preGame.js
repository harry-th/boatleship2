const preGame = ({ message, cookies, ss }) => {
    if (message.matched) {
        cookies.set('user', { ...cookies.get('user'), state: 'matched' })
        ss.timer.setStart(1, message.time)
        const { enemyinfo } = message
        ss.setEnemyInfo(enemyinfo)
        ss.setMessages(prev => {
            return [...prev, `Matched with ${enemyinfo.name} playing as ${enemyinfo.character}!`]
        })
        ss.setGameProgress('placement')
        ss.setCharacter(message.character)
        return
    }
    if (message.boatssent) {
        ss.timer.clear(1)
    }
    if (message.boatsreceived) {
        ss.timer.clear(1)
        cookies.set('user', { ...cookies.get('user'), state: 'ongoing' })
        if (message.charges) ss.setCharges(message.charges)
        if (message.bluffing === false || message.bluffing) ss.setBluffing(message.bluffing)
        if (message.turn) {
            ss.timer.setStart(1, message.time)
            ss.setMessages(prev => {
                return [...prev, 'Game start! you go first!']
            })
        } else {
            ss.timer.setStart(2, message.time)
            ss.setMessages(prev => {
                return [...prev, 'You will go second, freeshot 1 turn earlier...']
            })
        }
        ss.setGameProgress('ongoing')
        ss.setTurn(message.turn)
    }
}
export default preGame