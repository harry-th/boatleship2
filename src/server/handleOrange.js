const handleProtection = ({ index, boardState, enemyBoardState, freeShot }) => {
    if (!freeShot) {
        const recursiveRemoveProtection = (board) => {
            let protectedIndex = Object.values(board).findIndex((sq) => sq.state === 'protected')
            if (protectedIndex >= 0) {
                board[protectedIndex].state = false
            }
            if (Object.values(board).findIndex((sq) => sq.state === 'protected') >= 0) recursiveRemoveProtection(board)
        }
        recursiveRemoveProtection(boardState)
        recursiveRemoveProtection(enemyBoardState)
    }
    boardState[index].state = 'protected'
    enemyBoardState[index].state = 'protected'
}
const handleBluffing = () => {

}
const handleOrange = ({ index, boardState, enemyBoardState, freeShot, playerModifier, enemyModifier }) => {
    handleProtection({ index, boardState, enemyBoardState, freeShot })
    playerModifier = { ...playerModifier, orange: true }
    enemyModifier = { ...enemyModifier, orange: true }
}
module.exports = handleOrange