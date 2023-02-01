import { useState } from "react"

const useTimer = () => {

    const [timer1, setTimer1] = useState(sessionStorage.getItem('timer1') ? Number(JSON.parse(sessionStorage.getItem('timer1'))) : null)
    const [timer2, setTimer2] = useState(sessionStorage.getItem('timer2') ? Number(JSON.parse(sessionStorage.getItem('timer2'))) : null)
    const [code, setCode] = useState(null)
    const timers = { 1: { timer: timer1, setTimer: setTimer1 }, 2: { timer: timer2, setTimer: setTimer2 } }
    const start = (timer) => {
        setCode(setInterval(() => {
            timers[timer].setTimer(prev => {
                prev -= 1
                // sessionStorage.setItem('timer' + timer, prev)
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