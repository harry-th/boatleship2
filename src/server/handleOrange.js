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
    boardState[index].oldState ||= boardState[index].state
    boardState[index].state = 'protected'
    orangeShotResults.protected = index
    return orangeShotResults
}
const handleBluffing = ({ playerdata, index }) => {
    if (!playerdata.bluffing) playerdata.bluffing = 'bluffing'
    playerdata.bluffArray = playerdata.bluffArray ? [...playerdata.bluffArray, ...index] : index
}
const handleOrange = ({ index, playerdata, extrashot, bluffing }) => {
    let orangeShotResults = handleProtection({ index, boardState: playerdata.boardState, extrashot })
    if (bluffing) handleBluffing({ playerdata, index })
    return orangeShotResults
}
module.exports = handleOrange