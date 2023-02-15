import usePlacementLogic from "../hooks/usePlacement"

let useCornerMan = ({ cookies, orientation, boardState, setBoardState, boatNames, boatrules, boatPlacements, setBoatPlacements }) => {
    const rules = ({ positions, targets }) => {
        if (positions.some((pos) => targets.includes(pos))) return true
    }
    const manipulatePos = (positions) => {
        for (let i = 0; i < positions.length; i++) {
            if (positions[i] >= 100 && orientation === 'h') positions[i] = positions[i] - 100
            if (positions[i] >= 100 && orientation === 'v') positions[i] = positions[i] - 99
        }
        return positions
    }
    // needs to figure out how to maniulate positions in placement in a modular manner
    const cornerPlacement = usePlacementLogic({ orientation, cookies, boardState, character: 'cornerman', setBoardState, boatrules, boatPlacements, setBoatPlacements, rules, manipulatePos })


    const cornerHover = ({ index, gameProgress, boardState, boatLength, orientation, hoverState, setHoverState, }) => {

        if (gameProgress === 'placement' && boardState) {
            let coords = []
            for (let i = 0; i < boatLength; i++) {
                coords.push(orientation === 'h' ? index + i : index + i * 10)
            }
            for (let i = 0; i < coords.length; i++) {
                if (coords[i] >= 100 && orientation === 'h') coords[i] = coords[i] - 100
                if (coords[i] >= 100 && orientation === 'v') coords[i] = coords[i] - 99
            }
            let newHoverState = { ...hoverState }
            for (let i = 0; i < coords.length; i++) {
                if (boardState[coords[i]]?.state === 'mine') return
            }

            for (const square in newHoverState) {
                if (coords.includes(Number(square))) {
                    newHoverState[square].hover = 'hover'
                } else if (newHoverState[square].hover === 'hover') {
                    newHoverState[square].hover = false
                }
            }
            setHoverState(newHoverState)
        }
    }

    return {
        cornerHover,
        cornerPlacement
    }
}

export default useCornerMan




