import { useEffect } from 'react'
import { useState } from 'react'
import styles from '../styles/Customization.module.css'

const Customization = ({ character, setCharacter,
    boatNames, setBoatNames, cookies, socket, setMainMenuDisplay, opengames,
    joinLobbyErrorMessage, setJoinLobbyErrorMessage,
    setCookie }) => {
    const [display, setDisplay] = useState(!character ? 'character' : cookies.user.name ? 'done' : 'name')
    const [waiting, setWaiting] = useState(null)

    const [lobbyCharacter, setLobbyCharacter] = useState(false)
    const [charSelLobbyDisplay, setCharSelLobbyDisplay] = useState('default')
    const [privacy, setPrivacy] = useState(false)
    const [createGameErrorMessage, setCreateGameErrorMessage] = useState(false)
    const [password, setPassword] = useState()
    // const button = () => {
    //    return (<button onClick={() => {
    //         setCookie('user', { ...cookies.user, state: 'prematching' })
    //         setDisplay('home')
    //         setMessages([...messages])
    //       }}>back</button>)
    // }
    const [charSelDisplay, setCharSelDisplay] = useState((cookies.user.character && cookies.user.character !== 'default') ? 'characters' : 'default')
    const [boatFormDisplay, setBoatFormDisplay] = useState(false)
    const [hasCharacter, setHasCharacter] = useState(false)
    useEffect(() => {
        if (socket.current?.readyState === 1) socket.current.send(JSON.stringify({ request: 'opengames' }))
        let requestOpenGames = () => {
            return setTimeout(() => {
                socket.current.send(JSON.stringify({ request: 'opengames' }))
                requestOpenGames()
            }, 10000);
        }
        let code = requestOpenGames()
        return () => {
            clearTimeout(code)
        }
    }, [socket])
    useEffect(() => {
        if (cookies.user.character) setHasCharacter(true)
    }, [cookies.user.character])
    return (
        <div className={styles.customization}>
            {!cookies.user.name ?
                <div className={styles.nameselection}>
                    <label htmlFor='name'>Enter Your Name:</label>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        setCookie('user', { ...cookies.user, name: e.target.name.value })
                    }}><input name='name' type="text" /></form>
                </div> : <div className={styles.mainplay}>
                    <div className={styles.findgame}>
                        {!boatFormDisplay ? <div>
                            <button onClick={() => {
                                setCookie('user', { ...cookies.user, state: 'prematching' })
                                setMainMenuDisplay('home')
                            }}>home</button>
                            <div className={styles.characterselectcontainer}>
                                {charSelDisplay === 'default' &&
                                    <div className={styles.characterselect}>
                                        <div
                                            onClick={() => setCharSelDisplay('characters')}
                                        >characters</div>
                                        <div
                                            className={styles[(cookies.user.character === 'default') && 'selected']}
                                            onClick={() => setCookie('user', { ...cookies.user, character: 'default' })}
                                        >default</div>
                                    </div>}
                                {charSelDisplay === 'characters' &&
                                    <div className={styles.characterselect}>
                                        <button
                                            onClick={() => setCharSelDisplay('default')}
                                        >back</button>
                                        <div
                                            className={styles[(cookies.user.character === 'lineman') && 'selected']}
                                            onClick={() => setCookie('user', { ...cookies.user, character: 'lineman' })}
                                        >lineman</div>
                                        <div
                                            className={styles[(cookies.user.character === 'cornerman') && 'selected']}
                                            onClick={() => setCookie('user', { ...cookies.user, character: 'cornerman' })}
                                        >cornerman</div>
                                        <div
                                            className={styles[(cookies.user.character === 'orangeman') && 'selected']}
                                            onClick={() => setCookie('user', { ...cookies.user, character: 'orangeman' })}
                                        >orangeman</div>
                                    </div>}
                            </div>
                            <div>
                                <button onClick={() => setBoatFormDisplay(true)}>choose boat names</button>
                            </div>
                            <div>
                                <button onClick={() => {
                                    if (cookies?.user?.character) {
                                        let periods = () => {
                                            setTimeout(() => {
                                                setWaiting(prev => {
                                                    if (prev.match(/\.\.\./)) return 'waiting for match'
                                                    return prev + '.'
                                                })
                                                if (cookies.user.state === 'matching') periods()
                                            }, 1000)
                                        }
                                        periods()
                                        setWaiting('waiting for match')
                                        socket.current.send(JSON.stringify({ ...cookies.user }))
                                    } else {

                                    }
                                }}>{hasCharacter ? 'find game' : 'choose character'}</button>
                                <p>{waiting}</p>
                            </div>
                        </div> : <div className={styles.boatform} >
                            <button onClick={() => setBoatFormDisplay(false)}>back</button>
                            <form className={styles.boatfields}
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    setBoatFormDisplay(false)
                                    setCookie('user',
                                        {
                                            ...cookies.user,
                                            boatNames: Object.values(e.target)
                                                .map(item => item.value)
                                                .filter(item => item)
                                        })
                                }}>
                                <h4>Choose your Boat Names:</h4>
                                <label htmlFor='boat1'>destroyer</label>
                                <input name='boat1' defaultValue={boatNames[0]} />
                                <label htmlFor='boat2'>cruiser</label>
                                <input name='boat2' defaultValue={boatNames[1]} />
                                <label htmlFor='boat3'>battleship</label>
                                <input name='boat3' defaultValue={boatNames[2]} />
                                <label htmlFor='boat4'>carrier</label>
                                <input name='boat4' defaultValue={boatNames[3]} />
                                <button>submit</button>
                            </form>

                        </div>
                        }
                    </div>
                    <div className={styles.lobby}>
                        <div>
                            <div className={styles.characterselectcontainer}>
                                {charSelLobbyDisplay === 'default' &&
                                    <div className={styles.characterselect}>
                                        <div
                                            onClick={() => setCharSelLobbyDisplay('characters')}
                                        >characters</div>
                                        <div
                                            className={styles[(lobbyCharacter === 'default') && 'selected']}
                                            onClick={() => setLobbyCharacter('default')}
                                        >default</div>
                                    </div>}
                                {charSelLobbyDisplay === 'characters' &&
                                    <div className={styles.characterselect}>
                                        <button
                                            onClick={() => setCharSelLobbyDisplay('default')}
                                        >back</button>
                                        <div
                                            className={styles[(lobbyCharacter === 'lineman') && 'selected']}
                                            onClick={() => setLobbyCharacter('lineman')}
                                        >lineman</div>
                                        <div
                                            className={styles[(lobbyCharacter === 'cornerman') && 'selected']}
                                            onClick={() => setLobbyCharacter('cornerman')}
                                        >cornerman</div>
                                        <div
                                            className={styles[(lobbyCharacter === 'orangeman') && 'selected']}
                                            onClick={() => setLobbyCharacter('orangeman')}
                                        >orangeman</div>
                                    </div>}
                            </div>
                            <div>
                                <label htmlFor="privacy">{!privacy ? 'private? :' : 'password:'}</label>
                                <input type="checkbox" name="privacy" id=""
                                    onChange={() => setPrivacy(prev => !prev)}
                                />
                                {privacy && <input type="text" onChange={(e) => {
                                    console.log(e.target.value)
                                    setPassword(e.target.value)
                                }} />}
                                <button onClick={() => {
                                    if (lobbyCharacter) {
                                        if (((privacy && password) || (!privacy && !password))) {
                                            socket.current.send(JSON.stringify({
                                                name: cookies.user.name,
                                                state: 'matching',
                                                boatNames: cookies.user.boatNames,
                                                creategame: true,
                                                privacy,
                                                password,
                                                character: lobbyCharacter
                                            }))
                                        } else {
                                            setCreateGameErrorMessage('choose password')
                                            setTimeout(() => {
                                                setCreateGameErrorMessage(false)
                                            }, 1500);
                                        }
                                    } else {
                                        setCreateGameErrorMessage('choose character')
                                        setTimeout(() => {
                                            setCreateGameErrorMessage(false)
                                        }, 1500);
                                    }

                                }}>
                                    {!createGameErrorMessage ? 'create game' : createGameErrorMessage}
                                </button>
                            </div>
                            <div className={styles.lobbylist}>
                                {opengames.map((item => {
                                    if (item.privacy) {
                                        return (<p>{item.name} {joinLobbyErrorMessage && joinLobbyErrorMessage.id === item.lobbyId ? joinLobbyErrorMessage.msg : 'password :'} <form action="" onSubmit={(e) => {
                                            e.preventDefault()
                                            if ((item.type === 'character' && (lobbyCharacter === 'default' || !lobbyCharacter))) {
                                                setJoinLobbyErrorMessage({ id: item.lobbyId, msg: 'choose character' })
                                                setTimeout(() => {
                                                    setJoinLobbyErrorMessage(false)
                                                }, 1500);
                                            } else {
                                                socket.current.send(JSON.stringify({
                                                    password: e.target[0].value,
                                                    type: 'joingame',
                                                    name: cookies.user.name,
                                                    lobbyId: item.lobbyId,
                                                    character: (item.type === 'default' ? 'default' : lobbyCharacter),
                                                    boatNames
                                                }))
                                            }
                                        }}>
                                            <input type="text" />
                                        </form> </p>)
                                    } else {
                                        return (<p>{item.name} {item.type} <button onClick={() => {
                                            if ((item.type === 'character' && (lobbyCharacter === 'default' || !lobbyCharacter))) {
                                                setJoinLobbyErrorMessage({ id: item.lobbyId, msg: 'choose character' })
                                                setTimeout(() => {
                                                    setJoinLobbyErrorMessage(false)
                                                }, 1500);
                                            } else {
                                                socket.current.send(JSON.stringify({
                                                    type: 'joingame',
                                                    name: cookies.user.name,
                                                    lobbyId: item.lobbyId,
                                                    character: (item.type === 'default' ? 'default' : lobbyCharacter),
                                                    boatNames
                                                }))
                                            }
                                        }}
                                        >{joinLobbyErrorMessage && item.lobbyId === joinLobbyErrorMessage.id ? joinLobbyErrorMessage.msg : 'join'}</button></p>)
                                    }
                                }))}
                            </div>
                        </div>
                    </div>
                </div>}
        </div>)
}
export default Customization