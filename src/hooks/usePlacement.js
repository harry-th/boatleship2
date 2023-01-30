import { useEffect, useState } from "react"
const defaultRules = ({ positions, targets, orientation }) => {
    if (positions.some((pos) => targets.includes(pos))) return true
    if (orientation === 'h' && (Math.floor(positions[positions.length - 1] / 10) * 10) - (Math.floor(positions[0] / 10) * 10) > 0) return true
    if (orientation === 'v' && positions[positions.length - 1] > 99) return true
}
const usePlacementLogic = ({ socket, orientation, cookies, boardState, setBoardState, boatrules, character,
    boatPlacements, setBoatPlacements,
    rules = ({ positions, targets, orientation }) => defaultRules({ positions, targets, orientation }),
    manipulatePos }
) => {
    const { current, currentBoat, numberOfBoats } = boatrules
    const [targets, setTargets] = useState([])
    useEffect(() => {
        if (numberOfBoats.num !== current.num && !Array.isArray(boatPlacements)) {
            let oldPositions = Object.values({ ...boatPlacements }).map((boat) => boat.positions).flat()
            setBoardState((prev) => {
                for (const p in prev) {
                    if (oldPositions.includes(Number(p))) prev[p].state = 'mine'
                    else prev[p].state = null
                }
                return { ...prev }
            })
            setTargets(oldPositions)
        } else if (Object.keys(boatPlacements).length > 0) {
            setBoatPlacements({})
        }
    }, [boatPlacements, setBoardState, numberOfBoats.num, current.num, setBoatPlacements])
    const placement = (index) => {
        let positions = Array(currentBoat.length).fill().map((item, i) => {
            return orientation === 'h' ? index + i : index + i * 10
        })
        if (rules({ positions, targets, orientation })) return
        if (manipulatePos) {
            positions = manipulatePos(positions)
        }

        setBoatPlacements(prev => {
            return ({ ...prev, [currentBoat.name]: { name: currentBoat.name, positions, orientation, length: current.length } })
        })
        // let newBoardState = { ...boardState }
        // let oldPositions = Object.values({ ...boatPlacements, [currentBoat.name]: { name: currentBoat.name, positions, orientation, length: current.num } }).map((boat) => boat.positions).flat()
        // setTargets(oldPositions)

        // let allPositions = [...positions, ...oldPositions]
        // console.log(oldPositions)
        // for (const p in newBoardState) {
        //     if (allPositions.includes(Number(p))) newBoardState[p].state = 'mine'
        //     else newBoardState[p].state = null
        // }
        // console.log(newBoardState)
        // setBoardState(newBoardState)
        current.place()
        if (numberOfBoats.num === current.num + 1) {
            let placements = { ...boatPlacements, [currentBoat.name]: { name: currentBoat.name, positions, orientation, length: current.num } }
            let allPositions = Object.values(placements).map((boat) => boat.positions).flat()
            let newBoardState = { ...boardState }
            for (const p in newBoardState) {
                if (allPositions.includes(Number(p))) newBoardState[p].state = 'mine'
                else newBoardState[p].state = null
            }
            socket.send(JSON.stringify({
                character,
                boatdata: true, id: cookies.get('user').id,
                boatPlacements: placements,
                boardState: newBoardState,
                targets: [...targets, ...positions],
            }))
        }
    }
    return placement
}

export default usePlacementLogic