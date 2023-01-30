import { useState } from "react"

const useTimer = () => {

    const [timer1, setTimer1] = useState(null)
    const [timer2, setTimer2] = useState(null)
    const [code, setCode] = useState(null)
    const timers = { 1: { timer: timer1, setTimer: setTimer1 }, 2: { timer: timer2, setTimer: setTimer2 } }
    const start = (timer) => {
        setCode(setInterval(() => {
            timers[timer].setTimer(prev => {
                prev -= 1
                if (prev > 0) return prev
                else return "time's up!"
            })
        }, 1000))
    }
    const setStart = (timer, timeLength) => {
        set(timer, timeLength, start)
    }
    const stop = () => {
        clearInterval(code)
    }
    const clear = (timer) => {
        clearInterval(code)
        timers[timer].setTimer(null)
    }
    const set = (timer, timeLength, callback) => {
        timers[timer].setTimer(timeLength)
        callback(timer)
    }
    return { timer1, timer2, setStart, stop, clear, set }
}

export default useTimer