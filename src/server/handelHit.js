const handleHit = {
    normal: ({ index, enemyBoardState, enemyBoatPlacements, playerModifier, enemyModifier }) => {
        enemyBoardState[index].state = 'hit'
        const allHits = Object.values(enemyBoardState).filter((item) => {
            return item.state === 'hit'
        }).map((el) => Number(el.id))
        const shipsSunk = []
        let eBoatPlacements = enemyBoatPlacements
        for (const boat in eBoatPlacements) {
            if (!eBoatPlacements[boat].sunk && eBoatPlacements[boat].positions.every((b) => allHits.includes(b))) {
                eBoatPlacements[boat].sunk = true
                shipsSunk.push(boat)
                if (0) { //all ships sunk send win type message

                }
            }
        }
        playerModifier = { ...playerModifier, shipsSunk }
        enemyModifier = { ...enemyModifier, shipsSunk }
    },
    array: ({ index, enemyTargets, enemyBoardState, enemyBoatPlacements, playerModifier, enemyModifier }) => {
        const shipsSunk = []
        const shotresults = { missed: [], hit: [] }
        for (const shot of index) {
            if (enemyTargets.includes(shot)) {
                enemyBoardState[shot].state = 'hit'
                shotresults.hit.push(shot)
                const allHits = Object.values(enemyBoardState).filter((item) => {
                    return item.state === 'hit'
                }).map((el) => Number(el.id))
                let eBoatPlacements = enemyBoatPlacements
                for (const boat in eBoatPlacements) {
                    if (!eBoatPlacements[boat].sunk && eBoatPlacements[boat].positions.every((b) => allHits.includes(b))) {
                        eBoatPlacements[boat].sunk = true
                        shipsSunk.push(boat)
                        if (0) { //all ships sunk send win type message

                        }
                    }
                }
            } else {
                shotresults.missed.push(shot)
                enemyBoardState[shot].state = 'missed'
            }
        }
        playerModifier = { ...playerModifier, shipsSunk }
        enemyModifier = { ...enemyModifier, shipsSunk }
        return { shotresults, playerModifier, enemyModifier }
    },
    corner: ({ index, enemyBoardState, enemyBoatPlacements, playerModifier, enemyModifier }) => {
        const shotresults = { missed: [], hit: [] }

        enemyBoardState[index].state = 'hit'
        const allHits = Object.values(enemyBoardState).filter((item) => {
            return item.state === 'hit'
        }).map((el) => Number(el.id))
        const shipsSunk = []
        let eBoatPlacements = enemyBoatPlacements
        for (const boat in eBoatPlacements) {
            if (!eBoatPlacements[boat].sunk && allHits.includes(eBoatPlacements[boat].positions[0]) && allHits.includes(eBoatPlacements[boat].positions[eBoatPlacements[boat].positions.length - 1])) {
                eBoatPlacements[boat].sunk = true
                shotresults.hit = [...eBoatPlacements[boat].positions]
                shipsSunk.push(boat)
                if (0) { //all ships sunk send win type message

                }
            }
        }
        const newPlayerModifier = { ...playerModifier, shipsSunk }
        const newEnemyModifier = { ...enemyModifier, shipsSunk }
        return { shotresults, playerModifier, enemyModifier }

    }
}
module.exports = handleHit