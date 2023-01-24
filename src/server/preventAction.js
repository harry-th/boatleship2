
const preventAction = ({ index, lineman, orange, playerdata, enemydata }) => {
    if (index) {
        let fairSquares = Object.values(enemydata.boardState).filter((item) => {
            return item.state === null
        }).map(item => item.id)
        if (!index.every(i => fairSquares.includes(i))) return
    }
    if (lineman.twoShot || lineman.shootline) {
        if (lineman.charges <= 0) return
    }
    if (orange.retaliation) {
        if (orange.bluffing !== 'ready') return
    }
}