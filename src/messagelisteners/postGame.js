const postGame = ({ message, cookies, ss }) => {
    if (message.chat) {
        ss.setChat(prev => [...prev, message.chat])
    }
    if (message.hasLeft) {
        ss.setEnemyInfo(prev => {
            prev.lookingForRematch = 'left'
            return { ...prev }
        })
    }
    if (message.lookingForRematch) {
        ss.setEnemyInfo(prev => {
            prev.lookingForRematch = 'looking'
            return { ...prev }
        })
    }
    if (message.rematchAccepted) {
        ss.timer.setStart(1, message.time)
        cookies.set('user', { ...cookies.get('user'), state: 'matched' })
        const { enemyinfo } = message
        ss.setMessages(prev => {
            return [...prev, `Rematched with ${enemyinfo.name} playing as ${enemyinfo.character}!`]
        })
        ss.setGameProgress('placement')
        return
    }
    if (message.win) {
        cookies.set('user', { ...cookies.get('user'), wins: cookies.get('user').wins + 1 })
        ss.timer.clear(2) //time
        if (message.hasDisconnected) {
            ss.setEnemyInfo(prev => {
                prev.disconnected = true
                return prev
            })
        }
        ss.setGameProgress('winning screen')
    }
    if (message.loss) {
        ss.timer.clear(1) //time
        if (message.hasDisconnected) {
            alert('ran out of time')
        }
        cookies.set('user', { ...cookies.get('user'), losses: cookies.get('user').losses + 1 })
        ss.setGameProgress('losing screen')
    }
}

export default postGame