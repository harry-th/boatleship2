const handleProtection = ({ index, boardState, extrashot }) => {
    let orangeShotResults = {}
    let proSq = Object.values(boardState).filter((item) => {
        return item.state === 'protected'
    }).map(item => item.id)
    if (!extrashot) {
        for (const sq of proSq) {
            orangeShotResults[boardState[sq].oldState] = orangeShotResults[boardState[sq].oldState] ? [...orangeShotResults[boardState[sq].oldState], sq] : [sq]
            boardState[sq].state = boardState[sq].oldState
            delete boardState[sq].oldState
        }
    }
    boardState[index].oldState = boardState[index].state
    boardState[index].state = 'protected'
    orangeShotResults.protected = index
    return orangeShotResults
}
const handleBluffing = ({ playerdata, index }) => {
    if (!playerdata.bluffing) playerdata.bluffing = 'bluffing'
    if (playerdata.bluffing === 'bluffing' || playerdata.bluffing === 'ready') playerdata.bluffArray = playerdata.bluffArray ? [...playerdata.bluffArray, ...index] : index
    else if ((playerdata.bluffing === 'fired') && playerdata.bluffArray.includes(...index)) playerdata.bluffArray.splice(playerdata.bluffArray.findIndex(item => item === index[0]), 1)
}
const handleOrange = ({ index, playerdata, extrashot, bluffing }) => {
    let orangeShotResults = handleProtection({ index, boardState: playerdata.boardState, extrashot })
    if (bluffing) handleBluffing({ playerdata, index })
    return orangeShotResults
}
module.exports = handleOrange