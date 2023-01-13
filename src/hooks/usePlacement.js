import { useState } from "react"
const defaultRules = (positions, targets, orientation) => {
    if (positions.some((pos) => targets.includes(pos))) return true
    if (orientation === 'h' && (Math.floor(positions[positions.length - 1] / 10) * 10) - (Math.floor(positions[0] / 10) * 10) > 0) return true
    if (orientation === 'v' && positions[positions.length - 1] > 99) return true
}
const usePlacementLogic = ({ socket, orientation, cookies, boardState, setBoardState, boatrules,
    rules = (positions, targets, orientation) => defaultRules(positions, targets, orientation) }
) => {
    const [boatPlacements, setBoatPlacements] = useState([])
    const [targets, setTargets] = useState([])
    const { current, currentBoat, numberOfBoats } = boatrules

    const placement = (index) => {
        let positions = Array(currentBoat.length).fill().map((item, i) => {
            return orientation === 'h' ? index + i : index + i * 10
        })
        if (rules(positions, targets, orientation)) return

        setTargets(p => [...p, ...positions])
        setBoatPlacements(prev => {
            return ({ ...prev, [currentBoat.name]: { name: currentBoat.name, positions, orientation, length: current.num } })
        })
        let newBoardState = { ...boardState }
        for (const square in newBoardState) {
            if (positions.includes(Number(square))) {
                newBoardState[square].state = 'mine'
            }
        }
        setBoardState(newBoardState)
        current.place()
        if (numberOfBoats.num === current.num) {
            socket.send(JSON.stringify({ id: cookies.user.id, boatPlacements, boardState, targets, boatdata: true }))
        }
    }
    return placement
}

export default usePlacementLogic