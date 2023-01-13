import { useState } from "react"

const useBoatrules = () => {
    const [numberOfBoats, setNumberOfBoats] = useState(3) //4 techincally
    const [boatLengths, setBoatLengths] = useState([2, 3, 4, 5])
    const [boatNames, setBoatNames] = useState(['destroyer', 'cruiser', 'battleship', 'carrier'])
    const [boatsPlaced, setBoatsPlaced] = useState(0)
    const boatsRules = {
        current: {
            num: boatsPlaced,
            undo: () => setBoatsPlaced(prev => prev <= 0 ? 0 : prev - 1),
            place: () => setBoatsPlaced(prev => prev + 1),
            set: setBoatsPlaced
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