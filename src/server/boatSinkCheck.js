const normalSinkCheck = ({ enemydata, }) => {
    const shipsSunk = []
    const allHits = Object.values(enemydata.boardState).filter((item) => {
        return item.state === 'hit'
    }).map((el) => Number(el.id))
    for (const boat in enemydata.boatPlacements) {
        if (!enemydata.boatPlacements[boat].sunk
            && enemydata.boatPlacements[boat].positions.every((b) => allHits.includes(b))) {
            enemydata.boatPlacements[boat].sunk = true
            shipsSunk.push(boat)
        }
    }
    return { shipsSunk }
}
const cornerSinkCheck = ({ enemydata }) => {
    const shipsSunk = []
    let hits
    const allHits = Object.values(enemydata.boardState).filter((item) => {
        return item.state === 'hit'
    }).map((el) => Number(el.id))
    for (const boat in enemydata.boatPlacements) {
        if (!enemydata.boatPlacements[boat].sunk && allHits.includes(enemydata.boatPlacements[boat].positions[0])
            && allHits.includes(enemydata.boatPlacements[boat].positions[enemydata.boatPlacements[boat].positions.length - 1])) {
            enemydata.boatPlacements[boat].sunk = true
            hits = [...enemydata.boatPlacements[boat].positions]
            for (let i = 1; i < enemydata.boatPlacements[boat].positions.length - 1; i++) {
                enemydata.boardState[enemydata.boatPlacements[boat].positions[i]].state = 'hit'
            }
            shipsSunk.push(boat)
        }
    }
    return { shipsSunk, hits }
}
module.exports = { normalSinkCheck, cornerSinkCheck }