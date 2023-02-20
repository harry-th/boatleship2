const postGame = ({ message, cookies, ss }) => {
    if (message.issue === 'disconnect') {
        ss.setEnemyInfo(prev => {
            prev.lookingForRematch = 'left'
            return { ...prev }
        })
    }
    if (message.issue === 'reconnectAfterDisconnect') {
        if (cookies.get('user').state !== 'matching' && cookies.get('user').state !== 'prematching') {
            cookies.set('user', { ...cookies.get('user'), state: 'prematching' })
        }
    }
    if (message.chat) {
        ss.setChat(prev => [message.chat, ...prev])
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
        ss.setLastShots(prev => {
            return null
        })
        ss.setBluffing(prev => {
            if (prev) return false
        })
        ss.setEnemyInfo(enemyinfo)
        ss.setMessages(prev => {
            return [...prev, `Rematched with ${enemyinfo.name} playing as ${enemyinfo.character}!`]
        })
        ss.setGameProgress('placement')
        return
    }
    if (message.win) {
        ss.setMessages(prev => {
            return [...prev, 'You won!']
        })
        cookies.set('user', { ...cookies.get('user'), wins: cookies.get('user').wins + 1, state: 'aftergame' })
        ss.timer.clear(2) //time
        if (message.hasDisconnected) {
            ss.setEnemyInfo(prev => {
                prev.disconnected = true
                return prev
            })
        }
        setTimeout(() => {
            ss.setGameProgress('winning screen')
        }, 1500)
        return
    }
    if (message.loss) {
        ss.setMessages(prev => [...prev, 'You lost!'])
        ss.timer.clear(1) //time
        if (message.hasDisconnected) {
        }
        cookies.set('user', { ...cookies.get('user'), losses: cookies.get('user').losses + 1, state: 'aftergame' })
        setTimeout(() => {
            ss.setGameProgress('losing screen')
        }, 1500)
        return
    }
}

export default postGame