const generateBoard = (state, hover, num) => {
    const setBoard = () => {
        let answer = {}
        for (let i = 0; i < num; i++) {
            answer[i] = { id: i }
            if (state) answer[i].state = null
            if (hover) answer[i].hover = false
        }
        return answer
    }
    let board = setBoard()
    return board
}
export default generateBoard