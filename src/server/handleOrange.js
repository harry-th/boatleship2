const handleProtection = ({ index, boardState, extrashot }) => {

    let proSq = Object.values(boardState).filter((item) => {
        return item.state === 'protected'
    }).map(item => item.id)
    if (!extrashot) {
        for (const sq of proSq) {
            boardState[sq].state = boardState[sq].oldState
            delete boardState[sq].oldState
        }
    }
    boardState[index].oldState ||= boardState[index].state
    boardState[index].state = 'protected'

}
const handleBluffing = ({ playerdata, index }) => {
    if (!playerdata.bluffing) playerdata.bluffing = 'bluffing'
    playerdata.bluffArray = playerdata.bluffArray ? [...playerdata.bluffArray, index] : [index]
}
const handleOrange = ({ index, playerdata, extrashot, bluffing }) => {
    handleProtection({ index, boardState: playerdata.boardState, extrashot })
    if (bluffing) handleBluffing({ playerdata, index })
}
module.exports = handleOrange