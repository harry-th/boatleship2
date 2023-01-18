const handleProtection = ({ index, boardState, enemyBoardState, extrashot }) => {
    if (!extrashot) {
        let proSq = Object.values(boardState).filter((item) => {
            return item.state === 'protected'
        }).map(item => item.id)
        for (const sq of proSq) {
            boardState[sq].state = boardState[sq].oldState
            delete boardState[sq].oldState
        }
    }
    boardState[index].oldState ||= boardState[index].state
    boardState[index].state = 'protected'
}
const handleBluffing = ({ playerdata, index }) => {
    playerdata.bluffing = true
    playerdata.bluffArray = playerdata.bluffArray ? [...playerdata.bluffArray, index] : [index]
}
const handleOrange = ({ index, playerdata, extrashot, playerModifier, enemyModifier, bluffing }) => {
    handleProtection({ index, boardState: playerdata.boardState, extrashot })
    if (bluffing) handleBluffing({ playerdata, index })
    playerModifier = { ...playerModifier, orange: true }
    enemyModifier = { ...enemyModifier, orange: true }
}
module.exports = handleOrange