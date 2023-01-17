import { useState } from "react"
const defaultRules = ({ positions, targets, orientation }) => {
    if (positions.some((pos) => targets.includes(pos))) return true
    if (orientation === 'h' && (Math.floor(positions[positions.length - 1] / 10) * 10) - (Math.floor(positions[0] / 10) * 10) > 0) return true
    if (orientation === 'v' && positions[positions.length - 1] > 99) return true
}
const usePlacementLogic = ({ socket, orientation, cookies, boardState, setBoardState, boatrules, character,
    rules = ({ positions, targets, orientation }) => defaultRules({ positions, targets, orientation }),
    manipulatePos }
) => {
    const [boatPlacements, setBoatPlacements] = useState([])
    const [targets, setTargets] = useState([])
    const { current, currentBoat, numberOfBoats } = boatrules

    const placement = (index) => {
        let positions = Array(currentBoat.length).fill().map((item, i) => {
            return orientation === 'h' ? index + i : index + i * 10
        })
        if (rules({ positions, targets, orientation })) return
        if (manipulatePos) {
            positions = manipulatePos(positions)
        }

        setTargets(p => [...p, ...positions])
        setBoatPlacements(prev => {
            return ({ ...prev, [currentBoat.name]: { name: currentBoat.name, positions, orientation, length: current.num } })
        })
        let newBoardState = { ...boardState }
        for (const p of positions) {
            newBoardState[p].state = 'mine'
        }
        setBoardState(newBoardState)
        current.place()
        if (numberOfBoats.num === current.num + 1) {
            socket.send(JSON.stringify({
                character,
                boatdata: true, id: cookies.get('user').id,
                boatPlacements: { ...boatPlacements, [currentBoat.name]: { name: currentBoat.name, positions, orientation, length: current.num } },
                boardState,
                targets: [...targets, ...positions],
            }))
        }
    }
    return placement
}

export default usePlacementLogic