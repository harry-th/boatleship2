import { useState } from "react"

const useBoatrules = ({ names, setBoatPlacements }) => {
    const [numberOfBoats, setNumberOfBoats] = useState(4) //4 techincally
    const [boatLengths, setBoatLengths] = useState([2, 3, 4, 5])
    const [boatNames, setBoatNames] = useState(names || ['destroyer', 'cruiser', 'battleship', 'carrier'])
    const [boatsPlaced, setBoatsPlaced] = useState(0)
    const boatsRules = {
        current: {
            num: boatsPlaced,
            undo: () => { // known bug, if you match and place your boats and then refresh before the opponent, 
                //you can replace your boats and change the server(no gameplay problems however) and if you match before you place the boats again fully 
                //your boardstate will not match the server, though this can be rectified by refeshing 
                if (boatsPlaced !== numberOfBoats) {
                    setBoatPlacements(prev => {
                        console.log(Array.isArray(prev))
                        if (Array.isArray(prev)) return prev
                        delete prev[boatNames[boatsPlaced - 1]]
                        return { ...prev }
                    })
                    setBoatsPlaced(prev => prev <= 0 ? 0 : prev - 1)
                }
            },
            place: () => setBoatsPlaced(prev => prev + 1),
            set: setBoatsPlaced,
            length: boatLengths[boatsPlaced],
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