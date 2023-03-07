import { useState } from "react"

const useTimer = () => {

    const [timer1, setTimer1] = useState(null)
    const [timer2, setTimer2] = useState(null)
    const [code1, setCode1] = useState(null)
    const [code2, setCode2] = useState(null)
    const timers = { 1: { timer: timer1, setTimer: setTimer1, code: code1, setCode: setCode1 }, 2: { timer: timer2, setTimer: setTimer2, code: code2, setCode: setCode2 } }
    const start = (timer) => {
        timers[timer].setCode(setInterval(() => {
            timers[timer].setTimer(prev => {
                prev -= 1
                // sessionStorage.setItem('timer' + timer, prev)
                if (prev > 0) return prev
                else return "time's up!"
            })
        }, 1000))
    }
    const setStart = (timer, timeLength) => {
        stop()
        set(timer, timeLength, start)
    }
    const stop = () => {
        clear(1)
        clear(2)
    }
    const clear = (timer) => {
        clearInterval(timers[timer].code)
        timers[timer].setTimer(null)
    }
    const set = (timer, timeLength, callback) => {
        timers[timer].setTimer(timeLength)
        callback(timer)
    }
    return { timer1, timer2, setStart, stop, clear, set }
}

export default useTimer