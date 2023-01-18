const retaliation = ({ playerdata, enemydata }) => {
    const index = []
    let openShots = Object.values(enemydata.boardState).filter(item => item.state === null || item.state === 'mine').map(item => item.id)
    outerLoop: for (let i = 0; i < playerdata.bluffArray.length; i++) {
        for (let j = 0; j < 3; j++) {
            let random = Math.floor(Math.random() * openShots.length)
            index.push(openShots[random])
            openShots.splice(random, 1)
            if (openShots.length === 0) break outerLoop
        }
    }
    return index
}

module.exports = retaliation