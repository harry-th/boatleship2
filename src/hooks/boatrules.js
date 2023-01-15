import { useState } from "react"

const useBoatrules = (names) => {
    const [numberOfBoats, setNumberOfBoats] = useState(4) //4 techincally
    const [boatLengths, setBoatLengths] = useState([2, 3, 4, 5])
    const [boatNames, setBoatNames] = useState(names || ['destroyer', 'cruiser', 'battleship', 'carrier'])
    const [boatsPlaced, setBoatsPlaced] = useState(0)
    const boatsRules = {
        current: {
            num: boatsPlaced,
            undo: () => setBoatsPlaced(prev => prev <= 0 ? 0 : prev - 1),
            place: () => setBoatsPlaced(prev => prev + 1),
            set: setBoatsPlaced,
            done: boatsPlaced === numberOfBoats ? true : false
        },
        currentBoat: {
            name: boatNames[boatsPlaced],
            length: boatLengths[boatsPlaced],
        },
        numberOfBoats: {
            num: numberOfBoats,
            set: setNumberOfBoats
        },
        boatLengths: {
            lengths: boatLengths,
            set: setBoatLengths
        },
        boatNames: {
            names: boatNames,
            set: setBoatNames
        }
    }
    return boatsRules
}

export default useBoatrules